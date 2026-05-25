from rest_framework import serializers

from .models import User


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True
    )

    filiere_name = serializers.CharField(
        source='filiere.code',
        read_only=True
    )

    class Meta:

        model = User

        fields = [
            'id',
            'username',
            'email',
            'password',
            'role',
            'matricule',
            'filiere',
            'filiere_name',
        ]

    def create(self, validated_data):

        password = validated_data.pop(
            'password'
        )

        matricule = validated_data.get(
            'matricule'
        )

        if matricule == '':

            validated_data['matricule'] = None

        user = User(**validated_data)

        user.set_password(password)

        user.save()

        return user


class UserListSerializer(serializers.ModelSerializer):

    filiere_name = serializers.CharField(
        source='filiere.code',
        read_only=True
    )

    class Meta:

        model = User

        fields = [
            'id',
            'username',
            'email',
            'role',
            'matricule',
            'filiere',
            'filiere_name',
        ]