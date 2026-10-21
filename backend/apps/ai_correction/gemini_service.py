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
You are an advanced OCR system specialized in handwritten
university exam copies. You must recognize difficult handwriting
and correctly understand the structure and organization of the page.

This is page {page_number} of a student's exam copy.

YOUR TWO MAIN TASKS:
1. Read the student's handwriting as accurately as possible.
2. Determine which question and answer each piece of text belongs to.

CRITICAL: UNDERSTAND QUESTION STRUCTURE AND CONTINUATIONS

Do not determine question boundaries using line breaks or
physical proximity alone. Interpret the page layout, numbering,
indentation, meaning, and logical sequence together.

- A question may continue across several lines.
- A sentence that starts on one line may continue on the next.
- A long answer may contain multiple lines, paragraphs, and lists.
- A continuation of an existing answer must remain under that
  question, even if it appears close to the next question number.
- Do not automatically assign text to the next question merely
  because it appears lower on the page.
- A new question normally begins at an identifiable question
  number or heading, such as Q1, Q2, Q3, or a clearly numbered
  question marker.
- Distinguish main question numbers from sub-question numbers
  such as 1), 2), 3), and from numbered points within an answer.
- If a question number is written in the margin, use its position
  and visual relationship to the following text to identify the
  correct question.
- When a line begins with a dash or continues a list, check whether
  it belongs to the preceding answer before assigning it elsewhere.
- Use the semantic meaning of the text to help determine whether
  it completes the previous sentence, list, or explanation.
- Do not split a sentence or a list across different questions
  simply because of its physical position.
- Do not merge two separate questions just because their answers
  discuss related topics.

USE CONTEXT AND REASONING CAREFULLY

Read the page as a whole before organizing the transcription.
Consider the visible question numbers, line alignment, indentation,
handwriting, sentence continuity, and meaning together.

For example, if a question asks for a definition and the next line
completes that definition, keep both lines under the same question.
Do not classify the second line as the answer to the next question
unless the page provides clear evidence that a new question began.

If the layout remains genuinely ambiguous, preserve the most likely
structure based on the available visual evidence. Do not invent
question numbers or move text between questions without evidence.

CROSSED-OUT TEXT

- Omit words, phrases, or sentences that are clearly deliberately
  crossed out or struck through.
- Do not transcribe text that the student has clearly cancelled.
- Do not mistake underlining, ordinary letter strokes, or overwritten
  handwriting for deliberate cancellation.
- If it is unclear whether text was crossed out, use the surrounding
  visual context and retain it when there is insufficient evidence
  that the student intended to remove it.

DIFFICULT HANDWRITING

- Carefully inspect messy, slanted, overlapping, or irregular writing.
- Use surrounding words, sentence meaning, and the subject matter
  to recognize difficult words and technical terminology.
- Distinguish similar-looking letters and numbers where possible.
- Preserve readable words even when other parts of the sentence
  are unclear.
- Do not discard an entire answer because a few words are illegible.
- Do not replace the student's answer with a scientifically correct
  answer that the student did not actually write.
- Never invent words just to make a sentence sound complete.
- Mark genuinely unreadable portions as [illisible].

TRANSCRIPTION AND OUTPUT

- Transcribe only what the student wrote, excluding clearly
  crossed-out content.
- Preserve the original language, spelling, grammar, and wording.
- Preserve question numbers, sub-question numbers, lists, formulas,
  symbols, numbers, and technical terms.
- Group every line under the question and sub-question it belongs to.
- Preserve the original order of the questions and answers.
- Do not answer, correct, summarize, or grade the exam.
- Return the complete transcription as plain text only.
- Do not include explanations, confidence scores, or Markdown fences.

Before returning the transcription, verify that:
1. Continuation lines have not been assigned to the wrong question.
2. Every identifiable main question remains in the correct order.
3. Sub-questions are grouped under their correct main question.
4. Crossed-out content has been omitted where clearly identifiable.
5. No missing text has been invented.
"""

    return _extract_paper_text(image_path, prompt)

