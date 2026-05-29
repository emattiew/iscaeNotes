from apps.accounts.models import User


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

    text = text.upper()

    text = text.replace(
        "1E",
        "IE"
    )

    return text


def extract_notes(rows):

    notes = []

    for row in rows:

        if len(row) < 4:

            continue

        if row[0].lower() == "matricule":

            continue

        notes.append({

            "matricule":
                normalize_matricule(
                    row[0]
                ),

            "nom":
                row[1],

            "cc":
                int(row[2]),

            "cf":
                int(row[3]),
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