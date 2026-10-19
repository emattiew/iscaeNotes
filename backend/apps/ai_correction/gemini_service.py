import re
import google.generativeai as genai

from django.conf import settings
import mimetypes
from pathlib import Path
genai.configure(
    api_key=settings.GEMINI_API_KEY
)


def test_gemini():

    model = genai.GenerativeModel(
        "gemini-2.5-flash"
    )

    response = model.generate_content(
        "Say hello in French."
    )

    return response.text


def evaluate_answer(
    question,
    expected_answer,
    student_answer,
    max_score
):

    model = genai.GenerativeModel(
        "gemini-2.5-flash"
    )

    prompt = f"""
Tu es un assistant de correction universitaire.

Question :
{question}

Réponse attendue :
{expected_answer}

Réponse de l'étudiant :
{student_answer}

Note maximale :
{max_score}

Évalue la réponse de l'étudiant.

Attribue une note entre 0 et {max_score}.

Rédige le feedback en français.

Rédige le feedback à la troisième personne en t'adressant à l'enseignant.

Exemples :
- L'étudiant répond correctement à la question.
- La réponse de l'étudiant est partiellement correcte.
- L'étudiant mentionne les concepts essentiels mais certains détails sont absents.

Le feedback doit contenir 2 ou 3 phrases maximum.

Retourne UNIQUEMENT dans ce format :

Score: X
Feedback: Y
"""

    response = model.generate_content(
        prompt
    )

    text = response.text.strip()

    score_match = re.search(
        r"Score:\s*([0-9.]+)",
        text,
        re.IGNORECASE
    )

    feedback_match = re.search(
        r"Feedback:\s*(.*)",
        text,
        re.IGNORECASE | re.DOTALL
    )

    score = (
        float(score_match.group(1))
        if score_match
        else 0
    )

    feedback = (
        feedback_match.group(1).strip()
        if feedback_match
        else text
    )

    return {
        "score": score,
        "feedback": feedback
    }

def _extract_paper_text(image_path, prompt):
    """Use Gemini to transcribe one page and return plain text."""
    

    image_path = Path(image_path)

    with image_path.open("rb") as image_file:
        image_bytes = image_file.read()

    mime_type, _ = mimetypes.guess_type(str(image_path))
    mime_type = mime_type or "image/jpeg"

    model = genai.GenerativeModel("gemini-2.5-flash")

    response = model.generate_content([
        prompt,
        {
            "mime_type": mime_type,
            "data": image_bytes,
        },
    ])

    text = response.text

    if not text or not text.strip():
        raise ValueError("Gemini returned no OCR text.")

    return text.strip()


def extract_exam_questions_ocr(image_path, page_number=1):
    """Transcribe an exam question sheet."""
    prompt = f"""
You are an OCR system for university exam question papers.
Transcribe the text in this image accurately.

This is page {page_number} of an exam question sheet.

Rules:
- Return the actual text from the paper, not answers to the questions.
- Preserve the original language, wording, spelling, and order.
- Preserve question numbers, headings, sub-questions, and lists.
- Preserve mathematical expressions, numbers, symbols, and code.
- Do not summarize, solve, rewrite, or invent missing content.
- If text is unreadable, mark it as [illisible].
- Return plain text only. Do not use Markdown code fences.
"""
    return _extract_paper_text(image_path, prompt)


def extract_expected_answers_ocr(image_path, page_number=1):
    """Transcribe the model answer / correction sheet."""
    prompt = f"""
You are an OCR system for a university exam model answer sheet.
Transcribe the content of this image accurately.

This is page {page_number} of the model answer sheet.

Rules:
- Transcribe the expected answers, not new answers of your own.
- Preserve the original language, wording, and order.
- Preserve question numbers and keep each answer under its
  corresponding question heading when visible.
- Preserve explanations, lists, formulas, numbers, symbols, and code.
- Do not summarize, correct, rewrite, or invent content.
- If text is unreadable, mark it as [illisible].
- Return plain text only. Do not use Markdown code fences.
"""
    return _extract_paper_text(image_path, prompt)


def extract_exam_copy_ocr(image_path, page_number=1):
    """Transcribe a student's handwritten exam copy faithfully."""
    prompt = f"""
You are an OCR system for handwritten university exam copies.
Transcribe the student's handwriting as accurately as possible.

This is page {page_number} of a student's exam copy.

Rules:
- Transcribe only what the student actually wrote.
- Do not correct, rewrite, summarize, evaluate, or answer anything.
- Preserve the original language and order.
- Preserve question numbers, sub-questions, formulas, numbers,
  symbols, code, and technical terms.
- Keep each answer under its question heading when identifiable.
- Do not invent missing words or question numbers.
- If handwriting is unreadable, mark it as [illisible].
- Return plain text only. Do not use Markdown code fences.
"""
    return _extract_paper_text(image_path, prompt)
