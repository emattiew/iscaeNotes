from django.db import models

from apps.accounts.models import User
from apps.notes.models import Matiere


class Exam(models.Model):
    title = models.CharField(
        max_length=255
    )

    matiere = models.ForeignKey(
        Matiere,
        on_delete=models.CASCADE,
        related_name="exams"
    )

    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="created_exams"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.title


class ExamQuestion(models.Model):
    exam = models.ForeignKey(
        Exam,
        on_delete=models.CASCADE,
        related_name="questions"
    )

    question_number = models.PositiveIntegerField()

    question_text = models.TextField()

    expected_answer = models.TextField()

    max_score = models.DecimalField(
        max_digits=5,
        decimal_places=2
    )

    def __str__(self):
        return (
            f"Q{self.question_number} - "
            f"{self.exam.title}"
        )


class ExamCopy(models.Model):
    exam = models.ForeignKey(
        Exam,
        on_delete=models.CASCADE,
        related_name="copies"
    )

    student = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="exam_copies"
    )

    image = models.ImageField(
        upload_to="exam_copies/"
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    processed = models.BooleanField(
        default=False
    )

    def __str__(self):
        return f"Copy #{self.id}"


class OCRResult(models.Model):
    copy = models.OneToOneField(
        ExamCopy,
        on_delete=models.CASCADE,
        related_name="ocr_result"
    )

    raw_text = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"OCR Result for Copy "
            f"#{self.copy.id}"
        )
    
class ExtractedAnswer(models.Model):
    copy = models.ForeignKey(
        ExamCopy,
        on_delete=models.CASCADE,
        related_name="answers"
    )

    question = models.ForeignKey(
        ExamQuestion,
        on_delete=models.CASCADE
    )

    extracted_text = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"Answer Q{self.question.question_number} "
            f"for Copy #{self.copy.id}"
        )