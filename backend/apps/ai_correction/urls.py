from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    ExamViewSet,
    ExamQuestionViewSet,
    ExamCopyViewSet,
    CorrectionSheetViewSet,
    GeminiTestView,
    EvaluateAnswerView
)

router = DefaultRouter()

router.register("exams", ExamViewSet)
router.register("questions", ExamQuestionViewSet)
router.register("copies", ExamCopyViewSet)
router.register("correction-sheets", CorrectionSheetViewSet)

urlpatterns = router.urls + [
    path(
        "test-gemini/",
        GeminiTestView.as_view()
    ),
    path(
        "answers/<int:answer_id>/evaluate/",
        EvaluateAnswerView.as_view()
    ),
]