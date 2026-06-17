import easyocr

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    Exam,
    ExamQuestion,
    ExamCopy,
    OCRResult,
    ExtractedAnswer
)
from .parser import split_answers
from .serializers import (
    ExamSerializer,
    ExamQuestionSerializer,
    ExamCopySerializer,
    
)
from .gemini_service import test_gemini
from rest_framework.views import APIView

class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer


class ExamQuestionViewSet(viewsets.ModelViewSet):
    queryset = ExamQuestion.objects.all()
    serializer_class = ExamQuestionSerializer


class ExamCopyViewSet(viewsets.ModelViewSet):
    queryset = ExamCopy.objects.all()
    serializer_class = ExamCopySerializer

    @action(
        detail=True,
        methods=["post"]
    )
    def process_ocr(self, request, pk=None):

        copy = self.get_object()

        reader = easyocr.Reader(['fr'])

        result = reader.readtext(
            copy.image.path
        )

        raw_text = "\n".join(
            item[1]
            for item in result
        )

        OCRResult.objects.update_or_create(
            copy=copy,
            defaults={
                "raw_text": raw_text
            }
        )

        copy.processed = True
        copy.save()

        return Response({
            "copy_id": copy.id,
            "processed": True,
            "raw_text": raw_text
        })

    @action(
        detail=True,
        methods=["post"]
    )
    def extract_answers(
        self,
        request,
        pk=None
    ):

        copy = self.get_object()

        try:
            ocr_result = copy.ocr_result

        except OCRResult.DoesNotExist:

            return Response(
                {
                    "error": "OCR result not found"
                },
                status=400
            )

        parts = split_answers(
            ocr_result.raw_text
        )
        print("\n========== EXTRACTED PARTS ==========\n")

        for index, part in enumerate(parts, start=1):
            print(f"\n----- PART {index} -----\n")
            print(part)
            print("\n------------------------\n")

        print("\n========== END ==========\n")
        questions = (
            ExamQuestion.objects
            .filter(exam=copy.exam)
            .order_by("question_number")
        )

        created_answers = []

        for question, answer_text in zip(
            questions,
            parts
        ):

            answer, created = (
                ExtractedAnswer.objects.update_or_create(
                    copy=copy,
                    question=question,
                    defaults={
                        "extracted_text": answer_text
                    }
                )
            )

            created_answers.append({
                "question_id": question.id,
                "question_number": question.question_number,
                "answer_id": answer.id,
                "created": created
            })

        return Response({
            "success": True,
            "questions_found": questions.count(),
            "answers_detected": len(parts),
            "answers_processed": len(created_answers),
            "answers": created_answers
        })
    

class GeminiTestView(APIView):

    def post(self, request):

        try:

            result = test_gemini()

            return Response({
                "success": True,
                "response": result
            })

        except Exception as e:

            return Response({
                "success": False,
                "error": str(e)
            }, status=500)