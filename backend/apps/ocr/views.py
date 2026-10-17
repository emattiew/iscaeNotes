
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser

from apps.notes.models import (
    CollecteNote,
    StudentNote
)

from apps.accounts.models import User

import easyocr
import logging

from io import BytesIO
from PIL import Image

from .parser import (
    extract_notes_from_detections,
    match_students,
    normalize_matricule,
)

from .serializers import (
    OCRImportPreviewSerializer,
    OCRImportSerializer
)

from .gemini_review import review_grade_sheet


logger = logging.getLogger(__name__)


def parse_valid_grade(value):
    """
    Return a valid grade between 0 and 20, or None.
    """
    if value is None or isinstance(value, bool):
        return None

    try:
        grade = float(str(value).replace(",", ".").strip())
    except (TypeError, ValueError):
        return None

    if not 0 <= grade <= 20:
        return None

    return grade


def apply_gemini_review(notes, gemini_result):
    """
    Apply Gemini's confident, valid grades to existing EasyOCR results.

    Used as a fallback when Gemini does not return a usable
    complete student list.
    """
    if not isinstance(gemini_result, dict):
        return notes

    if not gemini_result.get("success"):
        logger.warning(
            "Gemini review failed; retaining EasyOCR grades."
        )
        return notes

    gemini_by_matricule = {}

    for student in gemini_result.get("students", []):
        if not isinstance(student, dict):
            continue

        matricule = student.get("matricule")

        if not matricule:
            continue

        normalized = normalize_matricule(
            str(matricule).strip()
        )

        if not normalized:
            continue

        gemini_by_matricule[normalized.upper()] = student

    for note in notes:
        matricule = note.get("matricule")

        if not matricule:
            continue

        normalized = normalize_matricule(
            str(matricule).strip()
        )

        if not normalized:
            continue

        gemini_student = gemini_by_matricule.get(
            normalized.upper()
        )

        if not gemini_student:
            continue

        for field in ("cc", "cf"):
            if gemini_student.get(
                f"{field}_confident"
            ) is not True:
                continue

            gemini_grade = parse_valid_grade(
                gemini_student.get(field)
            )

            if gemini_grade is None:
                continue

            note[field] = gemini_grade

    return notes


def build_notes_from_gemini(gemini_result):
    """
    Build preview records from Gemini's complete student list.

    This allows students missed by EasyOCR to appear in the
    preview, provided Gemini identifies their matricules.
    """
    if not isinstance(gemini_result, dict):
        return []

    if not gemini_result.get("success"):
        return []

    students = gemini_result.get("students", [])

    if not isinstance(students, list):
        return []

    notes = []
    seen_matricules = set()

    for student in students:
        if not isinstance(student, dict):
            continue

        matricule = str(
            student.get("matricule") or ""
        ).strip()

        if not matricule:
            continue

        normalized = normalize_matricule(matricule)

        if not normalized:
            normalized = matricule

        # Avoid duplicate rows for the same matricule.
        matricule_key = normalized.upper()

        if matricule_key in seen_matricules:
            continue

        seen_matricules.add(matricule_key)

        cc = parse_valid_grade(student.get("cc"))
        cf = parse_valid_grade(student.get("cf"))

        notes.append({
            "matricule": normalized,
            "nom": "",
            "cc": cc,
            "cf": cf,
        })

    return notes


class OCRUploadView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        image = request.FILES.get("image")

        if not image:
            return Response(
                {"error": "Aucune image envoyée"},
                status=400
            )

        image_bytes = image.read()

        try:
            with Image.open(BytesIO(image_bytes)) as opened_image:
                image_width = opened_image.width

        except Exception:
            return Response(
                {"error": "Impossible de lire le fichier image"},
                status=400
            )

        # Step 1: Run the existing EasyOCR pipeline.
        reader = easyocr.Reader(["fr"])
        result = reader.readtext(image_bytes)

        print("\n===== OCR RESULT =====")
        for item in result[:50]:
            print(item)
        print("===== END OCR =====\n")

        notes = extract_notes_from_detections(
            result,
            image_width
        )

        # Step 2: Ask Gemini to review the original image.
        gemini_result = review_grade_sheet(
            image_bytes,
            notes
        )

        # Step 3: Build the complete preview from Gemini.
        gemini_notes = build_notes_from_gemini(
            gemini_result
        )

        if gemini_notes:
            # Gemini's complete list includes students that
            # EasyOCR may not have detected.
            final_notes = gemini_notes

            logger.info(
                "Using %s student records from Gemini.",
                len(final_notes)
            )

        else:
            # Fallback: retain EasyOCR results and apply any
            # confident Gemini corrections that can be matched.
            final_notes = apply_gemini_review(
                notes,
                gemini_result
            )

            logger.warning(
                "Using EasyOCR fallback with %s student records.",
                len(final_notes)
            )

        # Temporary debugging information.
        print("\n===== FINAL OCR PREVIEW DEBUG =====")
        print("EasyOCR students:", len(notes))

        gemini_students = (
            gemini_result.get("students", [])
            if isinstance(gemini_result, dict)
            else []
        )

        print("Gemini students:", len(gemini_students))
        print("Final preview students:", len(final_notes))

        print("Final grades:", [
            {
                "matricule": note.get("matricule"),
                "cc": note.get("cc"),
                "cf": note.get("cf")
            }
            for note in final_notes
        ])

        print("===== END FINAL OCR PREVIEW DEBUG =====\n")

        # Step 4: Keep the existing student-matching logic.
        matches = match_students(final_notes)

        # Preserve the response expected by the React frontend.
        return Response({
            "matches": matches
        })


class OCRImportPreviewView(APIView):
    def post(self, request):
        serializer = OCRImportPreviewSerializer(
            data=request.data
        )
        serializer.is_valid(raise_exception=True)

        collecte_id = serializer.validated_data["collecte_id"]
        matches = serializer.validated_data["matches"]

        try:
            collecte = CollecteNote.objects.get(id=collecte_id)
        except CollecteNote.DoesNotExist:
            return Response(
                {"error": "Collecte introuvable"},
                status=404
            )

        students_found = sum(
            1 for match in matches if match.get("found")
        )

        students_missing = sum(
            1 for match in matches if not match.get("found")
        )

        return Response({
            "ready": students_missing == 0,
            "collecte_id": collecte.id,
            "matiere": collecte.matiere.name,
            "filiere": collecte.filiere.code,
            "students_found": students_found,
            "students_missing": students_missing,
            "notes_to_import": len(matches),
            "matches": matches
        })


class OCRImportView(APIView):
    def post(self, request):
        serializer = OCRImportSerializer(
            data=request.data
        )
        serializer.is_valid(raise_exception=True)

        collecte_id = serializer.validated_data["collecte_id"]
        matches = serializer.validated_data["matches"]

        try:
            collecte = CollecteNote.objects.get(id=collecte_id)
        except CollecteNote.DoesNotExist:
            return Response(
                {"error": "Collecte introuvable"},
                status=404
            )

        if collecte.status != "prepared":
            return Response(
                {
                    "error": (
                        "Seules les collectes préparées "
                        "peuvent être importées"
                    )
                },
                status=400
            )

        imported = 0

        for match in matches:
            if not match.get("found"):
                continue

            try:
                student = User.objects.get(
                    id=match["student_id"]
                )
            except (
                User.DoesNotExist,
                KeyError,
                TypeError,
                ValueError
            ):
                continue

            note, created = StudentNote.objects.get_or_create(
                collecte=collecte,
                student=student
            )

            cc = parse_valid_grade(match.get("cc"))
            cf = parse_valid_grade(match.get("cf"))

            if cc is not None:
                note.controle_continu = cc

            if cf is not None:
                note.controle_final = cf

            cc_value = note.controle_continu or 0
            cf_value = note.controle_final or 0

            note.note_finale = (
                cc_value * 0.4
                + cf_value * 0.6
            )

            note.save()
            imported += 1

        return Response({
            "success": True,
            "collecte_id": collecte.id,
            "imported_notes": imported
        })
