import easyocr

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .models import (
    Exam,
    ExamQuestion,
    ExamCopy,
    OCRResult,
    ExtractedAnswer,
    AICorrection,
    CorrectionSheet,
    CorrectionOCRResult,
    ExamSheet,
    ExamOCRResult
)
from .parser import (
    split_answers,
    split_expected_answers,
    split_questions
)
from .serializers import (
    ExamSerializer,
    ExamQuestionSerializer,
    ExamCopySerializer,
    CorrectionSheetSerializer,
    CorrectionOCRResultSerializer,
    ExamSheetSerializer,
    ExamOCRResultSerializer
    
)
from .gemini_service import (
    test_gemini,
    evaluate_answer
)
from rest_framework.views import APIView

class ExamViewSet(viewsets.ModelViewSet):

    queryset = Exam.objects.all()

    serializer_class = ExamSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Exam.objects.filter(
            teacher=self.request.user
        ).order_by("-created_at")

    def perform_create(self, serializer):

        serializer.save(
            teacher=self.request.user
        )
class ExamQuestionViewSet(viewsets.ModelViewSet):

    queryset = ExamQuestion.objects.all()

    serializer_class = ExamQuestionSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return ExamQuestion.objects.filter(
            exam__teacher=self.request.user
        ).order_by(
            "question_number"
        )


class ExamCopyViewSet(viewsets.ModelViewSet):

    queryset = ExamCopy.objects.all()

    serializer_class = ExamCopySerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return ExamCopy.objects.filter(
            exam__teacher=self.request.user
        ).order_by(
            "-uploaded_at"
        )

    def perform_create(self, serializer):

        exam = serializer.validated_data["exam"]

        if exam.teacher != self.request.user:

            raise PermissionDenied(
                "You cannot upload a copy for this exam."
            )

        serializer.save()

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
    
    @action(
        detail=True,
        methods=["post"]
    )
    def evaluate(self, request, pk=None):

        copy = self.get_object()

        answers = (
            copy.answers
            .select_related("question")
            .all()
        )

        evaluated = []

        total_score = 0

        for answer in answers:

            result = evaluate_answer(

                question=
                    answer.question.question_text,

                expected_answer=
                    answer.question.expected_answer,

                student_answer=
                    answer.extracted_text,

                max_score=
                    answer.question.max_score
            )

            correction, created = (
                AICorrection.objects.update_or_create(
                    answer=answer,
                    defaults={
                        "suggested_score":
                            result["score"],

                        "feedback":
                            result["feedback"]
                    }
                )
            )

            total_score += float(
                correction.suggested_score
            )

            evaluated.append({

                "answer_id":
                    answer.id,

                "question_number":
                    answer.question.question_number,

                "score":
                    correction.suggested_score,

                "created":
                    created
            })

        return Response({

            "success": True,

            "copy_id":
                copy.id,

            "answers_evaluated":
                len(evaluated),

            "total_score":
                total_score,

            "results":
                evaluated
        })
    
class CorrectionSheetViewSet(viewsets.ModelViewSet):

    queryset = CorrectionSheet.objects.all()

    serializer_class = CorrectionSheetSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return CorrectionSheet.objects.filter(
            exam__teacher=self.request.user
        )

    def perform_create(self, serializer):

        exam = serializer.validated_data["exam"]

        if exam.teacher != self.request.user:

            raise PermissionDenied(
                "You cannot upload a correction sheet for this exam."
            )

        serializer.save()

    @action(
        detail=True,
        methods=["post"]
    )
    def process_ocr(
        self,
        request,
        pk=None
    ):

        correction_sheet = (
            self.get_object()
        )

        reader = easyocr.Reader(
            ['fr']
        )

        result = reader.readtext(
            correction_sheet.image.path
        )

        raw_text = "\n".join(
            item[1]
            for item in result
        )

        CorrectionOCRResult.objects.update_or_create(
            correction_sheet=correction_sheet,
            defaults={
                "raw_text": raw_text
            }
        )
        print(raw_text)
        return Response({

            "correction_sheet_id":
                correction_sheet.id,

            "processed":
                True,

            "raw_text":
                raw_text
        })

    @action(
    detail=True,
    methods=["post"]
    )
    def extract_expected_answers(
        self,
        request,
        pk=None
    ):

        correction_sheet = (
            self.get_object()
        )

        try:

            ocr_result = (
                correction_sheet.ocr_result
            )

        except CorrectionOCRResult.DoesNotExist:

            return Response(
                {
                    "error":
                        "OCR result not found"
                },
                status=400
            )

        parts = split_expected_answers(
            ocr_result.raw_text
        )

        questions = (
            ExamQuestion.objects
            .filter(
                exam=correction_sheet.exam
            )
            .order_by(
                "question_number"
            )
        )

        first_question = (
            questions.first()
        )

        if first_question and parts:
            print("\nQUESTION FROM DB:")
            print(first_question.question_text)

            print("\nPART 1:")
            print(parts[0])
            position = parts[0].lower().find(
                first_question.question_text.lower()
            )

            if position != -1:

                parts[0] = parts[0][position:]

        print("\n===== CLEANED PART 1 =====\n")
        print(parts[0])
        print("\n===== END =====\n")

        if len(parts) != questions.count():

            return Response(
                {
                    "error":
                        "Questions count does not match extracted answers count",

                    "questions_found":
                        questions.count(),

                    "answers_detected":
                        len(parts)
                },
                status=400
            )

        updated = []

        for question, answer_text in zip(
            questions,
            parts
        ):

            question.expected_answer = (
                answer_text
            )

            question.save()

            updated.append({
                "question_number":
                    question.question_number
            })

        return Response({

            "success": True,

            "questions_found":
                questions.count(),

            "expected_answers_detected":
                len(parts),

            "updated_questions":
                updated
        })
class GeminiTestView(APIView):
    permission_classes = [
        IsAuthenticated
    ]
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
        
class EvaluateAnswerView(APIView):
    permission_classes = [
        IsAuthenticated
    ]
    def post(self, request, answer_id):

        try:

            answer = (
                ExtractedAnswer.objects
                .select_related("question")
                .get(id=answer_id)
            )
        
        except ExtractedAnswer.DoesNotExist:

            return Response(
                {
                    "error": "Answer not found"
                },
                status=404
            )
        if answer.copy.exam.teacher != request.user:

            return Response(
                {
                    "error": "Permission denied."
                },
                status=403
            )
        result = evaluate_answer(

            question=
                answer.question.question_text,

            expected_answer=
                answer.question.expected_answer,

            student_answer=
                answer.extracted_text,

            max_score=
                answer.question.max_score
        )

        correction, created = (
            AICorrection.objects.update_or_create(
                answer=answer,
                defaults={
                    "suggested_score":
                        result["score"],

                    "feedback":
                        result["feedback"]
                }
            )
        )

        return Response({

            "answer_id": answer.id,

            "suggested_score":
                correction.suggested_score,

            "feedback":
                correction.feedback,

            "created":
                created
        })
    
class ExamSheetViewSet(viewsets.ModelViewSet):

    queryset = ExamSheet.objects.all()

    serializer_class = ExamSheetSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return ExamSheet.objects.filter(
            exam__teacher=self.request.user
        )

    def perform_create(self, serializer):

        exam = serializer.validated_data["exam"]

        if exam.teacher != self.request.user:

            raise PermissionDenied(
                "You cannot upload an exam sheet for this exam."
            )

        serializer.save()

    @action(
        detail=True,
        methods=["post"]
    )
    def process_ocr(
        self,
        request,
        pk=None
    ):

        exam_sheet = (
            self.get_object()
        )

        reader = easyocr.Reader(
            ['fr']
        )

        result = reader.readtext(
            exam_sheet.image.path
        )

        raw_text = "\n".join(
            item[1]
            for item in result
        )

        ExamOCRResult.objects.update_or_create(
            exam_sheet=exam_sheet,
            defaults={
                "raw_text": raw_text
            }
        )
        
        return Response({

            "exam_sheet_id":
                exam_sheet.id,

            "processed":
                True,

            "raw_text":
                raw_text
        })

    @action(
    detail=True,
    methods=["post"]
    )
    def extract_questions(
        self,
        request,
        pk=None
    ):

        exam_sheet = (
            self.get_object()
        )

        try:

            ocr_result = (
                exam_sheet.ocr_result
            )

        except ExamOCRResult.DoesNotExist:

            return Response(
                {
                    "error":
                        "OCR result not found"
                },
                status=400
            )

        parts = split_questions(
            ocr_result.raw_text
        )

        questions = []

        for i, question_text in enumerate(
            parts,
            start=1
        ):

            questions.append({

                "question_number":
                    i,

                "question_text":
                    question_text,

                "max_score":
                    None
            })

        return Response({

            "success":
                True,

            "questions_detected":
                len(questions),

            "questions":
                questions
        })

    @action(
    detail=True,
    methods=["post"]
    )
    def validate_questions(
        self,
        request,
        pk=None
    ):

        exam_sheet = (
            self.get_object()
        )

        questions = request.data.get(
            "questions",
            []
        )

        ExamQuestion.objects.filter(
            exam=exam_sheet.exam
        ).delete()

        for question in questions:

            ExamQuestion.objects.create(

                exam=exam_sheet.exam,

                question_number=question[
                    "question_number"
                ],

                question_text=question[
                    "question_text"
                ],

                expected_answer="",

                max_score=question[
                    "max_score"
                ]
            )

        return Response({

            "success": True,

            "questions_saved":
                len(questions)
        })