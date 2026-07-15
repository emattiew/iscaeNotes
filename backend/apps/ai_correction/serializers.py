from rest_framework import serializers

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


class ExamSerializer(serializers.ModelSerializer):

    collecte_name = serializers.SerializerMethodField()
    
    collecte_status = serializers.CharField(
    source="collecte.status",
    read_only=True
    )
    class Meta:

        model = Exam

        fields = "__all__"

        read_only_fields = [
            "teacher",
            "created_at"
        ]

    def get_collecte_name(
        self,
        obj
    ):

        return (

            f"{obj.collecte.matiere.name}"

            f" - "

            f"{obj.collecte.filiere.code}"

            f" - "

            f"{obj.collecte.academic_year}"

        )

class ExamQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamQuestion
        fields = "__all__"


class ExamCopySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamCopy
        fields = "__all__"


class OCRResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = OCRResult
        fields = "__all__"


class AICorrectionSerializer(serializers.ModelSerializer):

    question_number = serializers.IntegerField(
        source="answer.question.question_number",
        read_only=True
    )

    question_text = serializers.CharField(
        source="answer.question.question_text",
        read_only=True
    )

    max_score = serializers.DecimalField(
        source="answer.question.max_score",
        max_digits=5,
        decimal_places=2,
        read_only=True
    )

    class Meta:

        model = AICorrection

        fields = [
            "id",
            "answer",
            "question_number",
            "question_text",
            "max_score",
            "suggested_score",
            "teacher_score",
            "feedback",
            "validated",
            "created_at"
        ]

class CorrectionSheetSerializer(serializers.ModelSerializer):
    class Meta:
        model = CorrectionSheet
        fields = "__all__"

class CorrectionOCRResultSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = CorrectionOCRResult
        fields = "__all__"

class ExamSheetSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = ExamSheet

        fields = "__all__"

class ExamOCRResultSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = ExamOCRResult

        fields = "__all__"