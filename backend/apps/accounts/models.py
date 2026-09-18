from django.contrib.auth.models import AbstractUser

from django.db import models


class User(AbstractUser):

    ROLE_CHOICES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin_staff', 'Admin Staff'),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES
    )

    matricule = models.CharField(
        max_length=50,
        unique=True,
        null=True,
        blank=True
    )

    filiere = models.ForeignKey(
        'notes.Filiere',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students'
    )
    niveau = models.CharField(
        max_length=2,
        choices=(
            ('L1', 'L1'),
            ('L2', 'L2'),
            ('L3', 'L3'),
        ),
        null=True,
        blank=True
    )
    def __str__(self):

        return self.username