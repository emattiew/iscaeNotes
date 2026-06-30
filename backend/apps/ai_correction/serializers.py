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

    matiere_name = serializers.CharField(
        source="matiere.name",
        read_only=True
    )

    class Meta:

        model = Exam

        fields = "__all__"

        read_only_fields = [
            "teacher",
            "created_at"
        ]


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
    class Meta:
        model = AICorrection
        fields = "__all__"

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