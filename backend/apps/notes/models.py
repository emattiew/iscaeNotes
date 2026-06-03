from django.db import models

from apps.accounts.models import User


class Module(models.Model):

    name = models.CharField(max_length=255)

    semestre = models.IntegerField()

    def __str__(self):

        return f'{self.name} - S{self.semestre}'


class Matiere(models.Model):

    module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        related_name='matieres'
    )

    name = models.CharField(max_length=255)

    coefficient = models.FloatField()

    credit = models.FloatField(default=0)

    def __str__(self):

        return self.name


class Filiere(models.Model):

    name = models.CharField(max_length=100)

    code = models.CharField(max_length=20)

    def __str__(self):

        return self.code


class CollecteNote(models.Model):

    STATUS_CHOICES = (
        ('prepared', 'Prepared'),
        ('opened', 'Opened'),
        ('validated', 'Validated'),
        ('published', 'Published'),
    )

    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='collectes'
    )

    matiere = models.ForeignKey(
        Matiere,
        on_delete=models.CASCADE
    )

    filiere = models.ForeignKey(
        Filiere,
        on_delete=models.CASCADE
    )

    academic_year = models.CharField(
        max_length=20
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='prepared'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return f'{self.matiere} - {self.filiere}'


class StudentNote(models.Model):

    collecte = models.ForeignKey(
        CollecteNote,
        on_delete=models.CASCADE,
        related_name='student_notes'
    )

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notes'
    )

    controle_continu = models.FloatField(
        default=0
    )

    controle_final = models.FloatField(
        default=0
    )

    note_finale = models.FloatField(
        default=0
    )

    is_validated = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:

        unique_together = (
            'collecte',
            'student',
        )

    def __str__(self):

        return f'{self.student} - {self.collecte}'
class ReclamationPeriod(models.Model):

    title = models.CharField(
        max_length=100
    )

    start_date = models.DateTimeField()

    end_date = models.DateTimeField()

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return self.title
class Reclamation(models.Model):

    STATUS_CHOICES = [

        ('pending', 'Pending'),

        ('accepted', 'Accepted'),

        ('rejected', 'Rejected'),
    ]

    period = models.ForeignKey(
    ReclamationPeriod,
    on_delete=models.CASCADE,
    related_name='reclamations',
    null=True,
    blank=True
)

    student_note = models.ForeignKey(
        'StudentNote',
        on_delete=models.CASCADE,
        related_name='reclamations'
    )

    student = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='reclamations'
    )

    message = models.TextField()

    teacher_response = models.TextField(
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    resolved_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_reclamations'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    resolved_at = models.DateTimeField(
        null=True,
        blank=True
    )

    def __str__(self):

        return (
            f"{self.student.username}"
            f" - {self.status}"
        )