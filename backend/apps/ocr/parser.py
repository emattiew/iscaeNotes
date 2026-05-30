from apps.accounts.models import User

import re


def group_rows(result):

    rows = {}

    for item in result:

        box = item[0]

        text = item[1]

        y = box[0][1]

        row_key = round(y / 50) * 50

        if row_key not in rows:

            rows[row_key] = []

        rows[row_key].append(text)

    return list(rows.values())


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

        value = str(value)

        match = re.search(
            r'\d+(?:[.,]\d+)?',
            value
        )

        if match:

            try:

                numbers.append(
                    float(
                        match.group().replace(
                            ',',
                            '.'
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

        if len(numbers) == 0:

            continue

        cc = None
        cf = None

        if len(numbers) == 1:

            cc = numbers[0]

        elif len(numbers) >= 2:

            cc = numbers[-2]

            cf = numbers[-1]

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