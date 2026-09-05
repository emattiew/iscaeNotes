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

    return part
def split_expected_answers(raw_text):

    # Normalize OCR text
    text = raw_text.replace("\r\n", "\n").replace("\r", "\n")

    # OCR can sometimes use "_" instead of a space
    text = re.sub(
        r'Question[_\s]+',
        'Question ',
        text,
        flags=re.IGNORECASE
    )

    # Remove page indicators
    text = re.sub(
        r'Page\s+\d+\s*/\s*\d+',
        '',
        text,
        flags=re.IGNORECASE
    )

    # Main answer/question headings.
    # IMPORTANT:
    # ^ means the heading must start at the beginning of a line.
    patterns = [
        r'^\s*Question\s+\d+\b',
        r'^\s*Q\s*\d+\b',
        r'^\s*Exercice\s+\d+\b',
        r'^\s*Ex\s*\d+\b',
        r'^\s*Probl[eè]me\s+\d+\b',
        r'^\s*\d+\s*[\.\)]',
        r'^\s*[IVX]+\s*[\.\)]',
    ]

    best_parts = []

    for pattern in patterns:

        first_match = re.search(
            pattern,
            text,
            flags=re.IGNORECASE | re.MULTILINE
        )

        if not first_match:
            continue

        # Ignore everything before the first answer/question
        answer_text = text[first_match.start():]

        parts = re.split(
            r'(?=' + pattern + r')',
            answer_text,
            flags=re.IGNORECASE | re.MULTILINE
        )

        cleaned_parts = []

        for part in parts:

            part = part.strip()

            if len(part) >= 20:
                cleaned_parts.append(part)

        if len(cleaned_parts) > len(best_parts):
            best_parts = cleaned_parts

    # Fallback
    if not best_parts:
        best_parts = [text.strip()]

    print("\n===== EXPECTED ANSWERS =====")

    for i, part in enumerate(best_parts, start=1):
        print(f"\nPART {i}")
        print(part[:500])

    print("\n===== END =====\n")

    return best_parts
def split_questions(raw_text):
    """
    Split OCR text into main exam questions.

    The parser supports common formats such as:
    Question 1
    Q1
    Exercice 1
    Ex 1
    Problème 1
    1.
    2)
    I.
    II.
    """

    # Normalize line endings
    text = raw_text.replace("\r\n", "\n").replace("\r", "\n")

    # Remove page indicators
    text = re.sub(
        r'Page\s+\d+\s*/\s*\d+',
        '',
        text,
        flags=re.IGNORECASE
    )

    # Patterns for main question headings
    patterns = [
        r'^\s*Question\s+\d+\b',
        r'^\s*Q\s*\d+\b',
        r'^\s*Exercice\s+\d+\b',
        r'^\s*Ex\s*\d+\b',
        r'^\s*Probl[eè]me\s+\d+\b',
        r'^\s*\d+\s*[\.\)]',
        r'^\s*[IVX]+\s*[\.\)]',
    ]

    best_parts = []

    for pattern in patterns:

        # Find where the first question starts
        first_match = re.search(
            pattern,
            text,
            flags=re.IGNORECASE | re.MULTILINE
        )

        if not first_match:
            continue

        # Remove everything before the first question
        question_text = text[first_match.start():]

        # Split from the question headings
        parts = re.split(
            r'(?=' + pattern + r')',
            question_text,
            flags=re.IGNORECASE | re.MULTILINE
        )

        cleaned_parts = []

        for part in parts:
            part = part.strip()

            if len(part) >= 20:
                cleaned_parts.append(part)

        if len(cleaned_parts) > len(best_parts):
            best_parts = cleaned_parts

    # Fallback
    if not best_parts:
        best_parts = [text.strip()]

    print("\n===== QUESTIONS =====")

    for i, part in enumerate(best_parts, start=1):
        print(f"\nQUESTION {i}")
        print(part[:500])

    print("\n===== END =====\n")

    return best_parts