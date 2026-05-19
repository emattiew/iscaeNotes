from rest_framework import serializers

from .models import (
    Module,
    Matiere,
    Filiere,
    CollecteNote,
    StudentNote,
)


class ModuleSerializer(serializers.ModelSerializer):

    class Meta:

        model = Module

        fields = '__all__'


class MatiereSerializer(serializers.ModelSerializer):

    module_name = serializers.CharField(
        source='module.name',
        read_only=True
    )

    class Meta:

        model = Matiere

        fields = '__all__'


class FiliereSerializer(serializers.ModelSerializer):

    class Meta:

        model = Filiere

        fields = '__all__'


class CollecteNoteSerializer(serializers.ModelSerializer):

    teacher_name = serializers.CharField(
        source='teacher.username',
        read_only=True
    )

    matiere_name = serializers.CharField(
        source='matiere.name',
        read_only=True
    )

    filiere_name = serializers.CharField(
        source='filiere.code',
        read_only=True
    )

    class Meta:

        model = CollecteNote

        fields = '__all__'

class StudentNoteSerializer(serializers.ModelSerializer):

    student_name = serializers.CharField(
        source='student.username',
        read_only=True
    )

    class Meta:

        model = StudentNote

        fields = '__all__'