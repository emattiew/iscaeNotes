from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    ExamViewSet,
    ExamQuestionViewSet,
    ExamCopyViewSet,
    GeminiTestView
)

router = DefaultRouter()

router.register("exams", ExamViewSet)
router.register("questions", ExamQuestionViewSet)
router.register("copies", ExamCopyViewSet)

urlpatterns = router.urls + [
    path(
        "test-gemini/",
        GeminiTestView.as_view()
    ),
]