
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser

from apps.notes.models import (
    CollecteNote,
    StudentNote
)

from apps.accounts.models import User

import easyocr
from io import BytesIO
from PIL import Image

from .parser import (
    group_rows,
    extract_notes,
    extract_notes_from_detections,
    match_students,
)

from .serializers import (
    OCRImportPreviewSerializer,
    OCRImportSerializer
)


class OCRUploadView(APIView):

    parser_classes = [MultiPartParser]

    def post(self, request):

        image = request.FILES.get('image')

        if not image:

            return Response(
                {
                    'error': 'Aucune image envoyée'
                },
                status=400
            )

        # Read the uploaded image once so we can use the same
        # bytes for EasyOCR and to determine the image width.
        image_bytes = image.read()

        try:
            with Image.open(BytesIO(image_bytes)) as opened_image:
                image_width = opened_image.width

        except Exception:

            return Response(
                {
                    'error': 'Impossible de lire le fichier image'
                },
                status=400
            )

        reader = easyocr.Reader(['fr'])

        result = reader.readtext(image_bytes)

        print("\n===== OCR RESULT =====")

        for item in result[:50]:
            print(item)

        print("===== END OCR =====\n")

        # Use the original bounding boxes to identify the CC and CF
        # columns instead of guessing from the order of numbers.
        notes = extract_notes_from_detections(
            result,
            image_width
        )

        matches = match_students(notes)

        return Response({
            'matches': matches
        })


class OCRImportPreviewView(APIView):

    def post(self, request):

        serializer = OCRImportPreviewSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        collecte_id = serializer.validated_data[
            'collecte_id'
        ]

        matches = serializer.validated_data[
            'matches'
        ]

        try:

            collecte = CollecteNote.objects.get(
                id=collecte_id
            )

        except CollecteNote.DoesNotExist:

            return Response(
                {
                    'error':
                        'Collecte introuvable'
                },
                status=404
            )

        students_found = len([
            m for m in matches
            if m.get('found')
        ])

        students_missing = len([
            m for m in matches
            if not m.get('found')
        ])

        return Response({

            'ready': students_missing == 0,

            'collecte_id': collecte.id,

            'matiere':
                collecte.matiere.name,

            'filiere':
                collecte.filiere.code,

            'students_found':
                students_found,

            'students_missing':
                students_missing,

            'notes_to_import':
                len(matches),

            'matches':
                matches
        })


class OCRImportView(APIView):

    def post(self, request):

        serializer = OCRImportSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        collecte_id = serializer.validated_data[
            'collecte_id'
        ]

        matches = serializer.validated_data[
            'matches'
        ]

        try:

            collecte = CollecteNote.objects.get(
                id=collecte_id
            )

        except CollecteNote.DoesNotExist:

            return Response(
                {
                    'error':
                        'Collecte introuvable'
                },
                status=404
            )

        if collecte.status != 'prepared':

            return Response(
                {
                    'error':
                        'Seules les collectes préparées peuvent être importées'
                },
                status=400
            )

        imported = 0

        for match in matches:

            if not match.get('found'):

                continue

            try:

                student = User.objects.get(
                    id=match['student_id']
                )

            except User.DoesNotExist:

                continue

            note, created = (
                StudentNote.objects.get_or_create(
                    collecte=collecte,
                    student=student
                )
            )

            cc = match.get('cc')
            cf = match.get('cf')

            # Safety check: never import a grade outside 0–20.
            if cc is not None:
                try:
                    cc = float(cc)
                except (TypeError, ValueError):
                    cc = None

                if cc is not None and not 0 <= cc <= 20:
                    cc = None

            if cf is not None:
                try:
                    cf = float(cf)
                except (TypeError, ValueError):
                    cf = None

                if cf is not None and not 0 <= cf <= 20:
                    cf = None

            if cc is not None:
                note.controle_continu = cc

            if cf is not None:
                note.controle_final = cf

            cc_value = note.controle_continu or 0
            cf_value = note.controle_final or 0

            note.note_finale = (
                cc_value * 0.4
                +
                cf_value * 0.6
            )

            note.save()

            imported += 1

        return Response({

            'success': True,

            'collecte_id': collecte.id,

            'imported_notes': imported
        })
