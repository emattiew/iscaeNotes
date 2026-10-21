import re



def split_answers(raw_text):
    """
    Split a student's exam copy into one section per main question.
    Preserve numbered sub-answers inside each main question.
    """

    text = raw_text.replace("\r\n", "\n").replace("\r", "\n")

    text = re.sub(
        r'Question[_\s]+',
        'Question ',
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r'Page\s+\d+\s*/\s*\d+',
        '',
        text,
        flags=re.IGNORECASE
    ).strip()

    if not text:
        return []

    def split_sections(source, pattern):
        matches = list(re.finditer(
            pattern,
            source,
            flags=re.IGNORECASE | re.MULTILINE
        ))

        if len(matches) < 2:
            return []

        parts = []

        for i, match in enumerate(matches):
            start = match.start()
            end = (
                matches[i + 1].start()
                if i + 1 < len(matches)
                else len(source)
            )

            part = source[start:end].strip()

            if len(part) >= 20:
                parts.append(part)

        return parts if len(parts) >= 2 else []

    # 1. Explicit main-question headings.
    question_pattern = (
        r'^[ \t]*(?:Question[ \t_]+\d+|Q[ \t]*\d+)\b[^\n]*'
    )

    parts = split_sections(text, question_pattern)

    if parts:
        best_parts = parts
    else:
        # 2. Exercise/problem headings.
        exercise_pattern = (
            r'^[ \t]*(?:Exercice|Ex|Probl[eè]me)[ \t]+\d+\b[^\n]*'
        )

        parts = split_sections(text, exercise_pattern)

        if parts:
            best_parts = parts
        else:
            # 3. Do not split on ordinary numbered answers.
            best_parts = [text]

    print("\n===== SPLIT ANSWERS =====")

    for i, part in enumerate(best_parts, start=1):
        print(f"\nPART {i}")
        print(part[:500])

    print("\n===== TOTAL:", len(best_parts), "=====")
    print("===== END =====\n")

    return best_parts


def split_expected_answers(raw_text):
    """
    Split an official correction sheet into one section per main question.
    Supports:
    - Question 1 / Question_1
    - Exercice 1 / Problème 1
    - 1. / 1) / 1 - numbered headings

    Preserves numbered sub-answers and bullet points inside each section.
    """
    text = raw_text.replace("\r\n", "\n").replace("\r", "\n")

    text = re.sub(
        r'Page\s+\d+\s*/\s*\d+',
        '',
        text,
        flags=re.IGNORECASE
    )

    # Remove the correction document's title/header if present.
    text = re.sub(
        r'^[ \t]*Correction officielle[^\n]*\n?',
        '',
        text,
        flags=re.IGNORECASE | re.MULTILINE
    ).strip()

    if not text:
        return []

    def split_sections(source, pattern):
        matches = list(re.finditer(
            pattern,
            source,
            flags=re.IGNORECASE | re.MULTILINE
        ))

        if len(matches) < 2:
            return []

        parts = []

        for i, match in enumerate(matches):
            start = match.start()
            end = (
                matches[i + 1].start()
                if i + 1 < len(matches)
                else len(source)
            )

            part = source[start:end].strip()

            if len(part) >= 10:
                parts.append(part)

        return parts if len(parts) >= 2 else []

    # 1. Explicit main-question headings.
    question_pattern = (
        r'^[ \t]*(?:Question[ \t_]+\d+|Q[ \t]*\d+)\b[^\n]*'
    )

    parts = split_sections(text, question_pattern)
    if parts:
        return parts

    # 2. Exercise/problem headings.
    exercise_pattern = (
        r'^[ \t]*(?:Exercice|Ex|Probl[eè]me)[ \t]+\d+\b[^\n]*'
    )

    parts = split_sections(text, exercise_pattern)
    if parts:
        return parts

    # 3. Numbered headings such as:
    # 1. Four functions...
    # 2. Role of the organization chart...
    #
    # Only split if numbering starts at 1 and continues
    # sequentially, avoiding arbitrary numbered sub-lists.
    numbered_pattern = r'^[ \t]*(\d{1,2})[ \t]*[.)][ \t]+'

    matches = list(re.finditer(
        numbered_pattern,
        text,
        flags=re.MULTILINE
    ))

    if len(matches) >= 2:
        numbers = [int(match.group(1)) for match in matches]

        if numbers == list(range(1, len(numbers) + 1)):
            parts = []

            for i, match in enumerate(matches):
                start = match.start()
                end = (
                    matches[i + 1].start()
                    if i + 1 < len(matches)
                    else len(text)
                )

                part = text[start:end].strip()

                if len(part) >= 10:
                    parts.append(part)

            if len(parts) >= 2:
                return parts

    # 4. Safe fallback: retain the complete correction.
    return [text]



def split_questions(raw_text):
    """
    Split OCR text into main exam questions.

    Priority:
    1. Explicit Question N headings.
    2. Explicit Exercice / Ex / Problème headings.
    3. Numbered questions such as 1. or 1).
    4. Keep the full text if no reliable split is found.
    """
    text = raw_text.replace("\r\n", "\n").replace("\r", "\n")

    text = re.sub(
        r'Page\s+\d+\s*/\s*\d+',
        '',
        text,
        flags=re.IGNORECASE
    ).strip()

    if not text:
        return []

    def split_at_headings(source, pattern):
        matches = list(re.finditer(
            pattern,
            source,
            flags=re.IGNORECASE | re.MULTILINE
        ))

        if len(matches) < 2:
            return []

        parts = []

        for i, match in enumerate(matches):
            start = match.start()
            end = (
                matches[i + 1].start()
                if i + 1 < len(matches)
                else len(source)
            )

            part = source[start:end].strip()

            if len(part) >= 10:
                parts.append(part)

        return parts if len(parts) >= 2 else []

    # 1. Explicit main-question headings.
    question_pattern = (
        r'^[ \t]*Question[ \t_]+\d+\b[^\n]*'
    )

    parts = split_at_headings(text, question_pattern)

    if parts:
        return parts

    # 2. Explicit exercise/problem headings.
    exercise_pattern = (
        r'^[ \t]*(?:Exercice|Ex|Probl[eè]me)[ \t]+\d+\b[^\n]*'
    )

    parts = split_at_headings(text, exercise_pattern)

    if parts:
        return parts

    # 3. Numbered main questions: 1. / 1) / 1 -
    # Only use this fallback when numbering starts at 1 and
    # continues sequentially. This helps avoid splitting on
    # arbitrary numbered lists.
    numbered_pattern = (
        r'^[ \t]*(\d{1,2})[ \t]*[.)][ \t]+'
    )

    matches = list(re.finditer(
        numbered_pattern,
        text,
        flags=re.MULTILINE
    ))

    if len(matches) >= 2:
        numbers = [int(match.group(1)) for match in matches]

        # Require a sequential sequence: 1, 2, 3, ...
        # If it isn't sequential, don't guess.
        if numbers == list(range(1, len(numbers) + 1)):
            parts = []

            for i, match in enumerate(matches):
                start = match.start()
                end = (
                    matches[i + 1].start()
                    if i + 1 < len(matches)
                    else len(text)
                )

                part = text[start:end].strip()

                if len(part) >= 10:
                    parts.append(part)

            if len(parts) >= 2:
                return parts

    # 4. Safest fallback: preserve the complete text.
    return [text]
