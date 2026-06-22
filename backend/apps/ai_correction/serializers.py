from rest_framework import serializers

from .models import (
    Exam,
    ExamQuestion,
    ExamCopy,
    OCRResult,
    ExtractedAnswer,
    AICorrection,
    CorrectionSheet,
    CorrectionOCRResult
)


class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = "__all__"


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