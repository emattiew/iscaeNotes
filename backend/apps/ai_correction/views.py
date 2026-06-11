from django.shortcuts import render

from rest_framework import viewsets

from .models import (
    Exam,
    ExamQuestion,
    ExamCopy
)

from .serializers import (
    ExamSerializer,
    ExamQuestionSerializer,
    ExamCopySerializer
)


class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer


class ExamQuestionViewSet(viewsets.ModelViewSet):
    queryset = ExamQuestion.objects.all()
    serializer_class = ExamQuestionSerializer


class ExamCopyViewSet(viewsets.ModelViewSet):
    queryset = ExamCopy.objects.all()
    serializer_class = ExamCopySerializer
