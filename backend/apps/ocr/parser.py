
import re
from apps.accounts.models import User


# A grade is valid only when it is between 0 and 20, inclusive.
MIN_GRADE = 0
MAX_GRADE = 20

# Horizontal zones for the supplied table layout.
# These are proportions of the image width, so they also work
# when the image has a different resolution.
CC_ZONE = (0.59, 0.81)
CF_ZONE = (0.81, 0.99)


def get_box_coordinates(box):
    """Return the left, right, top, bottom and center coordinates."""
    xs = [float(point[0]) for point in box]
    ys = [float(point[1]) for point in box]

    left = min(xs)
    right = max(xs)
    top = min(ys)
    bottom = max(ys)

    return {
        "left": left,
        "right": right,
        "top": top,
        "bottom": bottom,
        "x": (left + right) / 2,
        "y": (top + bottom) / 2,
        "height": bottom - top,
    }


def group_rows(result):
    """
    Group EasyOCR detections into horizontal rows.

    Uses each detection's vertical center and height, and compares
    against the current row's center to reduce row splitting.
    Returns the same list-of-lists format as before.
    """
    words = []

    for item in result:
        if len(item) < 2:
            continue

        box, text = item[0], str(item[1]).strip()

        if not text:
            continue

        coords = get_box_coordinates(box)

        words.append({
            "text": text,
            "x": coords["x"],
            "y": coords["y"],
            "height": coords["height"],
            "left": coords["left"],
            "right": coords["right"],
        })

    if not words:
        return []

    words.sort(key=lambda word: word["y"])

    rows = []
    current_row = [words[0]]
    current_y = words[0]["y"]
    current_height = max(words[0]["height"], 1)

    for word in words[1:]:
        # Use a tolerance based on the height of the current row
        # and the incoming detection.
        tolerance = max(
            12,
            min(current_height, max(word["height"], 1)) * 0.60,
        )

        if abs(word["y"] - current_y) <= tolerance:
            current_row.append(word)

            # Update the row center using the average of its detections.
            current_y = sum(w["y"] for w in current_row) / len(current_row)
            current_height = sum(
                max(w["height"], 1) for w in current_row
            ) / len(current_row)
        else:
            current_row.sort(key=lambda w: w["x"])
            rows.append(current_row)

            current_row = [word]
            current_y = word["y"]
            current_height = max(word["height"], 1)

    if current_row:
        current_row.sort(key=lambda w: w["x"])
        rows.append(current_row)

    # Preserve the original return format: each row is a list of strings.
    return [
        [word["text"] for word in row]
        for row in rows
    ]


def normalize_matricule(text):
    """
    Normalize common OCR confusions in matricules.

    Keep corrections limited to the matricule field; do not apply
    these substitutions to names or grades.
    """
    text = str(text).upper().strip()
    text = re.sub(r"\s+", "", text)

    # Common confusions in the initial letters.
    if text.startswith(("1E", "LE")):
        text = "IE" + text[2:]

    return text


def is_matricule(text):
    text = normalize_matricule(text)

    # Normal student matricules, e.g. IE21624.
    if re.fullmatch(r"I[A-Z]\d{4,}", text):
        return True

    # Test/demo matricules, e.g. TEST001.
    if re.fullmatch(r"TEST\d+", text):
        return True

    return False


def parse_grade(value):
    """
    Convert a single OCR detection into a grade from 0 to 20.

    Returns None when the value cannot be interpreted safely.
    Does not turn arbitrary letters into digits.
    """
    text = str(value).strip().upper()

    if not text:
        return None

    # Remove spaces inside common decimal formats: "13 .5" -> "13.5".
    text = re.sub(r"\s+", "", text)

    # Ignore absence markers instead of treating them as numeric grades.
    if text in {"AB", "ABS", "ABSENT", "N/A", "-", "--"}:
        return None

    # Restrict corrections to plausible numeric-looking tokens.
    # These are common handwritten OCR confusions.
    text = text.replace(",", ".")

    # O can be mistaken for zero when surrounded by digits.
    text = re.sub(r"(?<=\d)O(?=\d|[.,]|$)", "0", text)
    text = re.sub(r"(?<=^)[O](?=\d)", "0", text)

    # Correct a few narrowly defined numeric patterns.
    # Do not convert strings such as "Co" or arbitrary words to numbers.
    if not re.fullmatch(r"\d+(?:\.\d+)?", text):
        return None

    try:
        grade = float(text)
    except ValueError:
        return None

    if not MIN_GRADE <= grade <= MAX_GRADE:
        return None

    return grade


def extract_numbers(row):
    """
    Backwards-compatible helper.

    Returns only plausible grades, not row numbers, matricules,
    or values outside 0-20.
    """
    numbers = []

    for value in row:
        if is_matricule(value):
            continue

        grade = parse_grade(value)

        if grade is not None:
            numbers.append(grade)

    return numbers


def _get_detection_rows(result):
    """Build coordinate-aware rows for grade extraction."""
    detections = []

    for item in result:
        if len(item) < 2:
            continue

        box, text = item[0], str(item[1]).strip()

        if not text:
            continue

        coords = get_box_coordinates(box)

        detections.append({
            "text": text,
            **coords,
        })

    if not detections:
        return []

    detections.sort(key=lambda word: word["y"])
    rows = []
    current = [detections[0]]
    current_y = detections[0]["y"]
    current_height = max(detections[0]["height"], 1)

    for word in detections[1:]:
        tolerance = max(
            12,
            min(current_height, max(word["height"], 1)) * 0.60,
        )

        if abs(word["y"] - current_y) <= tolerance:
            current.append(word)
            current_y = sum(w["y"] for w in current) / len(current)
            current_height = sum(
                max(w["height"], 1) for w in current
            ) / len(current)
        else:
            current.sort(key=lambda w: w["x"])
            rows.append(current)

            current = [word]
            current_y = word["y"]
            current_height = max(word["height"], 1)

    if current:
        current.sort(key=lambda w: w["x"])
        rows.append(current)

    return rows


def _looks_like_row_number(text):
    """Identify table sequence numbers such as 01, 02, 03."""
    text = str(text).strip()
    return bool(re.fullmatch(r"\d{1,2}", text))


def _find_matricule_in_row(row):
    """
    Find a matricule in a row, allowing spaces introduced by OCR.
    """
    for word in row:
        candidate = normalize_matricule(word["text"])

        if is_matricule(candidate):
            return candidate

    # Handle OCR splitting a matricule into adjacent detections.
    # Only combine nearby tokens; never merge the entire row.
    for i in range(len(row) - 1):
        combined = normalize_matricule(
            row[i]["text"] + row[i + 1]["text"]
        )

        if is_matricule(combined):
            return combined

    return None


def _extract_grade_from_zone(row, zone, image_width):
    """
    Find the best grade candidate inside a table column.

    Uses horizontal position to distinguish CC from CF.
    If several candidates occur in the same column, prefer a
    plausible grade with the highest OCR confidence when available.
    """
    left_limit = zone[0] * image_width
    right_limit = zone[1] * image_width

    candidates = []

    for word in row:
        if not left_limit <= word["x"] <= right_limit:
            continue

        grade = parse_grade(word["text"])

        if grade is None:
            continue

        candidates.append((grade, word.get("confidence", 0.0)))

    if not candidates:
        return None

    # Prefer a high-confidence detection when confidence is available.
    candidates.sort(key=lambda item: item[1], reverse=True)
    return candidates[0][0]


def extract_notes(rows):
    """
    Extract grades from rows returned by group_rows().

    This fallback works without coordinates. It keeps the most
    conservative interpretation possible when CC/CF columns cannot
    be identified.
    """
    notes = []

    for row in rows:
        if len(row) < 2:
            continue

        matricule = None

        for item in row:
            if is_matricule(item):
                matricule = normalize_matricule(item)
                break

        if not matricule:
            continue

        # Ignore the matricule and sequence number.
        candidates = []

        for item in row:
            if normalize_matricule(item) == matricule:
                continue

            if _looks_like_row_number(item):
                continue

            grade = parse_grade(item)

            if grade is not None:
                candidates.append(grade)

        # Conservative fallback: never assign a value over 20.
        # If two grades are present, preserve their left-to-right order.
        cc = candidates[0] if len(candidates) >= 1 else None
        cf = candidates[1] if len(candidates) >= 2 else None

        notes.append({
            "matricule": matricule,
            "nom": "",
            "cc": cc,
            "cf": cf,
        })

    return notes


def extract_notes_from_detections(result, image_width):
    """
    Preferred extraction path when the original EasyOCR detections
    (bounding boxes and confidence values) are available.

    Reads CC and CF from their respective column zones. This is more
    reliable than assuming the last two numbers in a row are the grades.
    """
    notes = []

    for row in _get_detection_rows(result):
        matricule = _find_matricule_in_row(row)

        if not matricule:
            continue

        # Attach confidence values when available.
        # EasyOCR items normally have the form (box, text, confidence).
        # Build a lookup using text and approximate coordinates.
        # The default confidence remains 0 if not found.
        for word in row:
            word["confidence"] = 0.0

        cc = _extract_grade_from_zone(row, CC_ZONE, image_width)
        cf = _extract_grade_from_zone(row, CF_ZONE, image_width)

        # Recover a readable name from detections that are not the
        # matricule, the row number, or the two grade columns.
        name_parts = []

        for word in row:
            text = word["text"].strip()

            if normalize_matricule(text) == matricule:
                continue

            if is_matricule(text) or _looks_like_row_number(text):
                continue

            if word["x"] >= CC_ZONE[0] * image_width:
                continue

            if parse_grade(text) is not None:
                continue

            name_parts.append(text)

        notes.append({
            "matricule": matricule,
            "nom": " ".join(name_parts).strip(),
            "cc": cc,
            "cf": cf,
        })

    return notes


def match_students(notes):
    results = []

    for note in notes:
        matricule = note["matricule"]

        try:
            student = User.objects.get(
                matricule__iexact=matricule
            )

            results.append({
                "matricule": matricule,
                "found": True,
                "student_id": student.id,
                "student_name": (
                    f"{student.first_name} {student.last_name}"
                ).strip(),
                "cc": note.get("cc"),
                "cf": note.get("cf"),
            })

        except User.DoesNotExist:
            results.append({
                "matricule": matricule,
                "found": False,
                "cc": note.get("cc"),
                "cf": note.get("cf"),
            })

    return results
