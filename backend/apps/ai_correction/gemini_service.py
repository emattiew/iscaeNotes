import re
import google.generativeai as genai

from django.conf import settings

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