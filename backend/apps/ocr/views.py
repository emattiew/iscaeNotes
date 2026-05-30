from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser

from apps.notes.models import (
    CollecteNote,
    StudentNote
)

from apps.accounts.models import User

import easyocr

from .parser import (
    group_rows,
    extract_notes,
    match_students
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

        reader = easyocr.Reader(['fr'])

        result = reader.readtext(
            image.read()
        )

        rows = group_rows(result)

        notes = extract_notes(rows)

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

            if cc is not None:

                note.controle_continu = cc

            if cf is not None:

                note.controle_final = cf

            cc_value = (
                note.controle_continu or 0
            )

            cf_value = (
                note.controle_final or 0
            )

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