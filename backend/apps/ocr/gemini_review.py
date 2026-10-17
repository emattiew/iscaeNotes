
import json
import logging
from io import BytesIO

import google.generativeai as genai
from django.conf import settings
from PIL import Image


logger = logging.getLogger(__name__)


def review_grade_sheet(image_bytes, ocr_notes):
    """
    Ask Gemini to review a grade-sheet image and compare its readings
    with the grades extracted by EasyOCR.

    Gemini provides suggestions only. This function does not save
    or import grades into the database.
    """

    try:
        # Open the original grade-sheet image.
        image = Image.open(BytesIO(image_bytes)).convert("RGB")

        # Configure Gemini.
        genai.configure(api_key=settings.GEMINI_API_KEY)

        model = genai.GenerativeModel("gemini-2.5-flash")

        # Prompt for reviewing student identifiers and grades.
        prompt = f"""
Tu es un assistant spécialisé dans la lecture de feuilles de notes universitaires.

Ta tâche est de lire l'image originale et de vérifier les notes extraites par EasyOCR.

Résultats actuels d'EasyOCR :
{json.dumps(ocr_notes, ensure_ascii=False)}

Consignes :
- Lis uniquement les notes que tu peux réellement distinguer sur l'image.
- Ne devine jamais une note illisible.
- Les notes CC et CF doivent être comprises entre 0 et 20.
- Conserve les matricules tels qu'ils apparaissent sur l'image.
- Compare tes lectures avec celles d'EasyOCR.
- Pour chaque étudiant, retourne le matricule, la note CC lue sur l'image,
  la note CF lue sur l'image et un niveau de confiance.
- Si une note est illisible ou incertaine, retourne null pour cette note.
- N'invente aucun étudiant ni aucune note.
- Les champs cc_confident et cf_confident doivent être des booléens.
- Retourne uniquement un JSON valide, sans explication ni texte supplémentaire,
  sous cette forme :

{{
  "students": [
    {{
      "matricule": "IE12345",
      "cc": 12.5,
      "cf": 14,
      "cc_confident": true,
      "cf_confident": true
    }}
  ]
}}
"""

        # Send the prompt and original image to Gemini.
        response = model.generate_content([prompt, image])

        # DEBUG: inspect Gemini's actual response.
        print("\n===== GEMINI RAW RESPONSE =====")
        print("Response object:", response)
        print("Candidates:", response.candidates)
        print("Prompt feedback:", response.prompt_feedback)

        try:
            response_text = response.text.strip()
        except (ValueError, AttributeError) as exc:
            logger.warning(
                "Could not extract Gemini response text: %s",
                exc,
            )
            response_text = ""

        print("Response text:", repr(response_text))
        print("===== END GEMINI RAW RESPONSE =====\n")

        # Stop if Gemini did not return usable text.
        if not response_text:
            raise ValueError(
                "Gemini n'a retourné aucun texte exploitable. "
                "Vérifiez les candidats et le prompt feedback dans les logs."
            )

        # Remove optional Markdown code fences.
        if response_text.startswith("```"):
            response_text = response_text.split("\n", 1)[1]
            response_text = response_text.rsplit("```", 1)[0].strip()

        # Parse the JSON response exactly once.
        result = json.loads(response_text)

        # Validate the response structure.
        if not isinstance(result, dict):
            raise ValueError("Réponse Gemini invalide.")

        students = result.get("students")

        if not isinstance(students, list):
            raise ValueError(
                "Liste des étudiants absente de la réponse Gemini."
            )

        # Validate each student entry.
        for student in students:
            if not isinstance(student, dict):
                raise ValueError(
                    "Une entrée étudiant dans la réponse Gemini est invalide."
                )

        logger.info(
            "Gemini review completed successfully. Students returned: %s",
            len(students),
        )

        return {
            "success": True,
            "students": students,
        }

    except Exception:
        logger.exception(
            "Erreur pendant la vérification Gemini de la feuille de notes."
        )

        # Preserve the existing EasyOCR fallback.
        return {
            "success": False,
            "students": [],
        }
