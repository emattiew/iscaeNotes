from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser

import easyocr

from .parser import (
    group_rows,
    extract_notes,
    match_students
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