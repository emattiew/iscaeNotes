from django.db import models


class Module(models.Model):

    name = models.CharField(max_length=255)

    semestre = models.IntegerField()

    def __str__(self):
        return self.name


class Matiere(models.Model):

    module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        related_name='matieres'
    )

    name = models.CharField(max_length=255)

    coefficient = models.FloatField()

    def __str__(self):
        return self.name