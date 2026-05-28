from rest_framework.views import APIView

from rest_framework.response import Response

from rest_framework.parsers import MultiPartParser

import easyocr


class OCRUploadView(APIView):

    parser_classes = [MultiPartParser]


    def post(self, request):

        image = request.FILES.get('image')

        if not image:

            return Response(
                {
                    'error':
                        'Aucune image envoyée'
                },
                status=400
            )


        reader = easyocr.Reader(['fr'])

        result = reader.readtext(
            image.read()
        )


        extracted_text = []

        for item in result:

            extracted_text.append(item[1])


        return Response({

            'text': extracted_text
        })