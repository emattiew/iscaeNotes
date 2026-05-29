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


    def update(self, instance, validated_data):

        password = validated_data.pop(
            'password',
            None
        )

        matricule = validated_data.get(
            'matricule'
        )

        if matricule == '':

            validated_data['matricule'] = None


        for attr, value in validated_data.items():

            setattr(instance, attr, value)


        if password:

            instance.set_password(password)


        instance.save()

        return instance


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
            'first_name',
            'last_name',
            'email',
            'role',
            'matricule',
            'filiere',
            'filiere_name',
        ]