import re


def split_answers(raw_text):

    pattern = r'(?:Q\s*[0-9I]+\)|Question\s*\d+\)|\b\d+\))'

    parts = re.split(
        pattern,
        raw_text,
        flags=re.IGNORECASE
    )

    parts = [
    p.strip()
    for p in parts
    if p.strip()
]

    if len(parts) > 1:
        parts = parts[1:]

    print("\n===== SPLIT ANSWERS =====")

    for i, part in enumerate(parts, start=1):

        print(f"\nPART {i}")
        print(part[:300])

    print("\n===== END =====\n")

    return parts
def split_expected_answers(raw_text):

    pattern = r'(?:Q\s*[0-9I]+\)?|Question\s*\d+\)?|\b\d+\))'

    parts = re.split(
        pattern,
        raw_text,
        flags=re.IGNORECASE
    )

    parts = [
        p.strip()
        for p in parts
        if p.strip()
    ]

    if len(parts) > 1:
        parts = parts[1:]

    print("\n===== EXPECTED ANSWERS =====")

    for i, part in enumerate(parts, start=1):

        print(f"\nPART {i}")
        print(part[:300])

    print("\n===== END =====\n")

    return parts


def split_questions(raw_text):

    pattern = r'\b\d+\.'

    parts = re.split(
        pattern,
        raw_text
    )

    parts = [
        p.strip()
        for p in parts
        if p.strip()
    ]

   
    if len(parts) > 1:
        parts = parts[1:]

    print("\n===== QUESTIONS =====")

    for i, part in enumerate(parts, start=1):

        print(f"\nQUESTION {i}")
        print(part[:300])

    print("\n===== END =====\n")

    return parts