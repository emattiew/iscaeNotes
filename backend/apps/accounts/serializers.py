
from rest_framework import serializers

from .models import User


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )

    filiere_name = serializers.CharField(
        source='filiere.code',
        read_only=True
    )

    teacher_filieres = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User._meta.get_field('teacher_filieres').remote_field.model.objects.all(),
        required=False
    )

    class Meta:

        model = User

        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'password',
            'role',
            'matricule',
            'filiere',
            'niveau',
            'filiere_name',
            'teacher_filieres',
        ]

    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        teacher_filieres = validated_data.pop('teacher_filieres', [])

        matricule = validated_data.get('matricule')

        if matricule == '':
            validated_data['matricule'] = None

        user = User(**validated_data)

        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()

        user.save()
        user.teacher_filieres.set(teacher_filieres)

        return user


    def update(self, instance, validated_data):

        password = validated_data.pop('password', None)
        teacher_filieres = validated_data.pop('teacher_filieres', None)

        matricule = validated_data.get('matricule')

        if matricule == '':
            validated_data['matricule'] = None

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()

        if teacher_filieres is not None:
            instance.teacher_filieres.set(teacher_filieres)

        return instance


class UserListSerializer(serializers.ModelSerializer):

    filiere_name = serializers.CharField(
        source='filiere.code',
        read_only=True
    )
    teacher_filieres = serializers.PrimaryKeyRelatedField(
    many=True,
    read_only=True
)
    class Meta:

        model = User

        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'role',
            'matricule',
            'filiere',
            'niveau',
            'filiere_name',
            'teacher_filieres',
        ]
