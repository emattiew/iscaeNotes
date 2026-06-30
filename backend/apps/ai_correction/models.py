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
    
class AICorrection(models.Model):
    answer = models.OneToOneField(
        ExtractedAnswer,
        on_delete=models.CASCADE,
        related_name="ai_correction"
    )

    suggested_score = models.DecimalField(
        max_digits=5,
        decimal_places=2
    )

    feedback = models.TextField()

    teacher_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )

    validated = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"AI Correction for Answer "
            f"#{self.answer.id}"
        )
    
class CorrectionSheet(models.Model):

    exam = models.ForeignKey(
        Exam,
        on_delete=models.CASCADE,
        related_name="correction_sheets"
    )

    image = models.ImageField(
        upload_to="correction_sheets/"
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"Correction Sheet #{self.id}"
        )

class CorrectionOCRResult(models.Model):

    correction_sheet = models.OneToOneField(
        CorrectionSheet,
        on_delete=models.CASCADE,
        related_name="ocr_result"
    )

    raw_text = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"OCR Result for Correction "
            f"#{self.correction_sheet.id}"
        )
    

class ExamSheet(models.Model):

    exam = models.ForeignKey(
        Exam,
        on_delete=models.CASCADE,
        related_name="exam_sheets"
    )

    image = models.ImageField(
        upload_to="exam_sheets/"
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return (
            f"Exam Sheet #{self.id}"
        )
    

class ExamOCRResult(models.Model):

    exam_sheet = models.OneToOneField(
        ExamSheet,
        on_delete=models.CASCADE,
        related_name="ocr_result"
    )

    raw_text = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return (
            f"OCR Result for Exam Sheet #{self.exam_sheet.id}"
        )