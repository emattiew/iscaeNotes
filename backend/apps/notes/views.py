from rest_framework.viewsets import ModelViewSet

from rest_framework.decorators import action

from rest_framework.response import Response

from rest_framework import status


from apps.accounts.permissions import IsAdminRole

from .models import (
    Module,
    Matiere,
    Filiere,
    CollecteNote,
    StudentNote,
)

from .serializers import (
    ModuleSerializer,
    MatiereSerializer,
    FiliereSerializer,
    CollecteNoteSerializer,
    StudentNoteSerializer,
)


class ModuleViewSet(ModelViewSet):

    queryset = Module.objects.all()

    serializer_class = ModuleSerializer

    permission_classes = [IsAdminRole]


class MatiereViewSet(ModelViewSet):

    queryset = Matiere.objects.all()

    serializer_class = MatiereSerializer

    permission_classes = [IsAdminRole]


class FiliereViewSet(ModelViewSet):

    queryset = Filiere.objects.all()

    serializer_class = FiliereSerializer

    permission_classes = [IsAdminRole]


class CollecteViewSet(ModelViewSet):

    queryset = CollecteNote.objects.all()

    serializer_class = CollecteNoteSerializer

    permission_classes = [IsAdminRole]


    @action(
        detail=True,
        methods=['post']
    )
    def validate(self, request, pk=None):

        collecte = self.get_object()

        collecte.status = 'validated'

        collecte.save()


        StudentNote.objects.filter(
            collecte=collecte
        ).update(
            is_validated=True
        )


        return Response(
            {
                'message':
                    'Collecte validée avec succès'
            },
            status=status.HTTP_200_OK
        )


    @action(
        detail=True,
        methods=['post']
    )
    def publish(self, request, pk=None):

        collecte = self.get_object()

        collecte.status = 'published'

        collecte.save()


        return Response(
            {
                'message':
                    'Collecte publiée avec succès'
            },
            status=status.HTTP_200_OK
        )


class StudentNoteViewSet(ModelViewSet):

    serializer_class = StudentNoteSerializer

    permission_classes = [IsAdminRole]


    def get_queryset(self):

        queryset = StudentNote.objects.all()

        collecte_id = self.request.query_params.get(
            'collecte'
        )

        if collecte_id:

            queryset = queryset.filter(
                collecte_id=collecte_id
            )

        return queryset