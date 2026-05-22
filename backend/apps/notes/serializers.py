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

        validators = []


    def create(self, validated_data):

        controle_continu = validated_data.get(
            'controle_continu',
            0
        )

        controle_final = validated_data.get(
            'controle_final',
            0
        )

        note_finale = (
            (controle_continu * 0.4) +
            (controle_final * 0.6)
        )

        validated_data['note_finale'] = (
            note_finale
        )

        student_note, created = (
            StudentNote.objects.update_or_create(

                collecte=validated_data['collecte'],

                student=validated_data['student'],

                defaults={

                    'controle_continu':
                        controle_continu,

                    'controle_final':
                        controle_final,

                    'note_finale':
                        note_finale,
                }
            )
        )

        return student_note