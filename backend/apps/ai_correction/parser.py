
import re


def split_answers(raw_text):
    """
    Split a student's exam copy into one section per main question.
    Supports:
    - Question I / Question II
    - Question 1 / Question 2
    - Question_1 / Question_II
    - Q1 / Q2
    - Exercice 1 / Problème 2

    Preserves numbered sub-answers inside each main question.
    """

    text = raw_text.replace("\r\n", "\n").replace("\r", "\n")

    # Normalize OCR variations such as Question_I and Question_II.
    text = re.sub(
        r'\bQuestion[_ \t]+',
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

        print(f"[split_answers] Found {len(matches)} headings")
        for match in matches:
            print("[split_answers] Heading:", repr(match.group(0)))

        if len(matches) < 2:
            return []

        parts = []

        for i, match in enumerate(matches):
            # Keep the document introduction with the first question.
            start = 0 if i == 0 else match.start()
            end = (
                matches[i + 1].start()
                if i + 1 < len(matches)
                else len(source)
            )

            part = source[start:end].strip()

            if len(part) >= 20:
                parts.append(part)

        return parts if len(parts) >= 2 else []

    # 1. Explicit main-question headings, including Roman numerals.
    question_pattern = (
        r'^[ \t]*'
        r'(?:Question[ \t_]*|Q[ \t_]*)'
        r'(?P<number>[IVXLCDM]{1,7}|\d{1,2})'
        r'\b[ \t]*[:.)-]?[ \t]*(?:\([^\n]*\))?[ \t]*$'
    )

    parts = split_sections(text, question_pattern)

    if parts:
        best_parts = parts
    else:
        # 2. Exercise/problem headings.
        exercise_pattern = (
            r'^[ \t]*(?:Exercice|Ex|Probl[eè]me)'
            r'[ \t]+\d{1,2}\b[^\n]*'
        )

        parts = split_sections(text, exercise_pattern)

        if parts:
            best_parts = parts
        else:
            # 3. Safe fallback: don't split ordinary numbered answers.
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
    Split an official correction sheet into main-question sections.

    Supports:
    - Question 1, Question I, Question II
    - Question_1, Question_II
    - Q1, Q II
    - Exercice 1, Exercice II, Problème 1
    - Numbered main-question headings as a cautious fallback

    Preserves numbered subanswers within explicit main-question sections.
    """

    text = raw_text.replace("\r\n", "\n").replace("\r", "\n")

    text = re.sub(
        r'Page\s+\d+\s*/\s*\d+',
        '',
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r'^[ \t]*Correction[ \t]+officielle[^\n]*\n?',
        '',
        text,
        flags=re.IGNORECASE | re.MULTILINE
    ).strip()

    if not text:
        return []

    def split_sections(source, matches):
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

    flags = re.IGNORECASE | re.MULTILINE

    # 1. Explicit Question headings: Arabic numbers or Roman numerals.
    question_pattern = (
        r'^[ \t]*'
        r'(?:Question[ \t_]*|Q[ \t_]*)'
        r'(?:\d{1,2}|[IVXLCDM]+)'
        r'\b[ \t]*:?[^\n]*'
    )

    matches = list(re.finditer(question_pattern, text, flags))

    parts = split_sections(text, matches)

    if parts:
        return parts

    # 2. Explicit exercise/problem headings.
    exercise_pattern = (
        r'^[ \t]*'
        r'(?:Exercice|Ex|Probl[eè]me)'
        r'[ \t_]+(?:\d{1,2}|[IVXLCDM]+)'
        r'\b[ \t]*:?[^\n]*'
    )

    matches = list(re.finditer(exercise_pattern, text, flags))

    parts = split_sections(text, matches)

    if parts:
        return parts

    # 3. Numbered headings such as "1. ...", "2. ...".
    # This fallback is inherently ambiguous: numbered subquestions
    # can look exactly like numbered main questions.
    numbered_pattern = r'^[ \t]*(\d{1,2})[ \t]*[.)][ \t]+'

    matches = list(re.finditer(
        numbered_pattern,
        text,
        re.MULTILINE
    ))

    if len(matches) >= 2:
        numbers = [int(match.group(1)) for match in matches]

        if numbers == list(range(1, len(numbers) + 1)):
            # Only use this fallback when the numbered headings
            # are separated by blank lines, providing some evidence
            # that they are separate main sections.
            separated_by_blank_lines = all(
                re.search(
                    r'\n[ \t]*\n[ \t]*$',
                    text[matches[i].end():matches[i + 1].start()]
                )
                for i in range(len(matches) - 1)
            )

            if separated_by_blank_lines:
                parts = split_sections(text, matches)

                if parts:
                    return parts

    # 4. Safest fallback: do not guess when the structure is unclear.
    return [text]


def split_questions(raw_text):
    """Split an exam into main sections without splitting subquestions."""
    text = raw_text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(
        r'Page\s+\d+\s*/\s*\d+',
        '',
        text,
        flags=re.IGNORECASE
    ).strip()

    if not text:
        return []

    # Accept Arabic numbers and Roman numerals.
    # Also allow OCR variations such as Question_II or QuestionII.
    question_pattern = (
        r'^[ \t]*Question[ \t_]*'
        r'(\d{1,2}|[IVXLCDM]+)'
        r'\b[ \t]*:?[^\n]*'
    )

    matches = list(re.finditer(
        question_pattern,
        text,
        flags=re.IGNORECASE | re.MULTILINE
    ))

    print(
        f"[split_questions] Found {len(matches)} headings",
        flush=True
    )

    for match in matches:
        print(
            f"[split_questions] Heading: {match.group(0)!r}",
            flush=True
        )

    # Split only when at least two explicit main-question headings exist.
    if len(matches) >= 2:
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
            print(
                f"[split_questions] Returning {len(parts)} questions",
                flush=True
            )
            return parts

    # Preserve the existing exercise/problem fallback.
    exercise_pattern = (
        r'^[ \t]*(?:Exercice|Ex|Probl[eè]me)'
        r'[ \t]+\d+\b[^\n]*'
    )

    matches = list(re.finditer(
        exercise_pattern,
        text,
        flags=re.IGNORECASE | re.MULTILINE
    ))

    if len(matches) >= 2:
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

    return [text]

