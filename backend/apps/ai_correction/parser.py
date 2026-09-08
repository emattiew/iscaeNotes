import re


def split_answers(raw_text):
    """
    Split OCR text from a student's exam copy
    into one answer section per main question.

    Supports formats such as:
    Question 1
    Question_1
    Q1
    Q 1
    Exercice 1
    Ex 1
    Problème 1

    Numbered sub-questions such as:
    1)
    2)
    (a)
    (b)

    are kept inside their main question.
    """

    # Normalize line endings
    text = raw_text.replace("\r\n", "\n").replace("\r", "\n")

    # OCR may produce Question_1 instead of Question 1
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

    # Main question headings only.
    # They must start at the beginning of a line.
    patterns = [
        r'^\s*Question\s+\d+\b',
        r'^\s*Q\s*\d+\b',
        r'^\s*Exercice\s+\d+\b',
        r'^\s*Ex\s*\d+\b',
        r'^\s*Probl[eè]me\s+\d+\b',
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

        # Ignore everything before the first main question
        answer_text = text[first_match.start():]

        # Split only at main question headings
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

    # Fallback for exams that do not use "Question 1", "Q1", etc.
    if not best_parts:

        pattern = r'^\s*\d+\s*[\.\)]'

        first_match = re.search(
            pattern,
            text,
            flags=re.MULTILINE
        )

        if first_match:

            answer_text = text[first_match.start():]

            parts = re.split(
                r'(?=' + pattern + r')',
                answer_text,
                flags=re.MULTILINE
            )

            best_parts = [
                part.strip()
                for part in parts
                if len(part.strip()) >= 20
            ]

    # Final fallback
    if not best_parts:
        best_parts = [text.strip()]

    print("\n===== SPLIT ANSWERS =====")

    for i, part in enumerate(best_parts, start=1):

        print(f"\nPART {i}")
        print(part[:500])

    print("\n===== TOTAL:", len(best_parts), "=====")
    print("===== END =====\n")

    return best_parts
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