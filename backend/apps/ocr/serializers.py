from rest_framework import serializers


class OCRImportPreviewSerializer(
    serializers.Serializer
):

    collecte_id = serializers.IntegerField()

    matches = serializers.ListField()


class OCRImportSerializer(
    serializers.Serializer
):

    collecte_id = serializers.IntegerField()

    matches = serializers.ListField()