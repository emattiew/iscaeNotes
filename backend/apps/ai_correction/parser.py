import re


def split_answers(raw_text):
    pattern = r'\b\d+\)'

    parts = re.split(pattern, raw_text)

    parts = [
        p.strip()
        for p in parts
        if p.strip()
    ]

    return parts