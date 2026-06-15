from rest_framework import serializers

from .models import (
    Exam,
    ExamQuestion,
    ExamCopy,
    OCRResult
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