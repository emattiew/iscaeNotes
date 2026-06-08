from apps.accounts.models import User

import re

def group_rows(result):

    words = []

    for item in result:

        box = item[0]
        text = item[1]

        center_x = (
            box[0][0] +
            box[2][0]
        ) / 2

        center_y = (
            box[0][1] +
            box[2][1]
        ) / 2

        height = abs(
            box[2][1] -
            box[0][1]
        )

        words.append({

            "text": text,

            "x": center_x,

            "y": center_y,

            "height": height
        })

    if not words:
        return []

    avg_height = sum(
        w["height"]
        for w in words
    ) / len(words)

    threshold = avg_height * 0.45

    words.sort(
        key=lambda x: x["y"]
    )

    rows = []

    current_row = []

    current_y = None

    for word in words:

        if current_y is None:

            current_y = word["y"]

            current_row.append(word)

            continue

        if abs(
            word["y"] - current_y
        ) <= threshold:

            current_row.append(word)

        else:

            current_row.sort(
                key=lambda x: x["x"]
            )

            rows.append([
                w["text"]
                for w in current_row
            ])

            current_row = [word]

            current_y = word["y"]

    if current_row:

        current_row.sort(
            key=lambda x: x["x"]
        )

        rows.append([
            w["text"]
            for w in current_row
        ])

    return rows


def normalize_matricule(text):

    text = str(text).upper().strip()

    text = text.replace(
        "1E",
        "IE"
    )

    text = text.replace(
        "LE",
        "IE"
    )

    text = text.replace(
        " ",
        ""
    )

    return text


def is_matricule(text):

    text = normalize_matricule(text)

    return bool(
        re.match(
            r'^IE\d+$',
            text
        )
    )


def extract_numbers(row):

    numbers = []

    for value in row:

        value = str(value).strip()
            
        value = value.replace("Co", "60")
        value = value.replace('"o', "10")
        value = value.replace("'o", "10")
        value = value.replace("6o", "60")
        value = value.replace("o", "0")
        value = value.replace("O", "0")
        if is_matricule(value):
            continue

        if "AB" in value.upper():
            continue

        if re.fullmatch(
            r'\d+(?:[.,]\d+)?',
            value
        ):

            try:

                if (
                    value.isdigit()
                    and len(value) == 3
                ):

                    value = (
                        value[:2]
                        +
                        "."
                        +
                        value[2]
                    )

                numbers.append(
                    float(
                        value.replace(
                            ",",
                            "."
                        )
                    )
                )

            except ValueError:
                pass

    return numbers


def extract_notes(rows):

    notes = []

    for row in rows:

        if len(row) < 2:

            continue

        matricule = None

        for item in row:

            if is_matricule(item):

                matricule = normalize_matricule(
                    item
                )

                break

        if not matricule:

            continue

        numbers = extract_numbers(row)

        print("ROW:", row)
        print("NUMBERS:", numbers)
        print("-" * 50)
        if len(numbers) == 0:

            continue

        cc = None
        cf = None

        if len(numbers) == 1:

            if numbers[0] > 20:

                continue

            cc = numbers[0]

        elif len(numbers) >= 2:

            valid_numbers = [
                n for n in numbers
                if 0 <= n <= 20
            ]

            if len(valid_numbers) >= 2:

                cc = valid_numbers[-2]

                cf = valid_numbers[-1]

            elif len(valid_numbers) == 1:

                cc = valid_numbers[0]

        name_parts = []

        for item in row:

            text = str(item)

            if normalize_matricule(text) == matricule:

                continue

            if re.fullmatch(
                r'\d+(?:[.,]\d+)?',
                text.strip()
            ):

                continue

            name_parts.append(text)

        nom = " ".join(name_parts).strip()

        notes.append({

            "matricule": matricule,

            "nom": nom,

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

                "student_name":
                    f"{student.first_name} {student.last_name}",

                "cc": note["cc"],

                "cf": note["cf"],
            })

        except User.DoesNotExist:

            results.append({

                "matricule": matricule,

                "found": False,

                "cc": note["cc"],

                "cf": note["cf"],
            })

    return results