from rest_framework.viewsets import ModelViewSet

from rest_framework.decorators import action

from rest_framework.response import Response

from rest_framework import status

from rest_framework.permissions import IsAuthenticated


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

    serializer_class = CollecteNoteSerializer

    permission_classes = [IsAuthenticated]


    def get_queryset(self):

        user = self.request.user


        if user.role == 'admin_staff':

            return CollecteNote.objects.all()


        if user.role == 'teacher':

            return CollecteNote.objects.filter(
                teacher=user
            )


        return CollecteNote.objects.none()


    @action(
        detail=True,
        methods=['post']
    )
    def validate(self, request, pk=None):

        collecte = self.get_object()


        if request.user.role not in [
            'teacher',
            'admin_staff'
        ]:

            return Response(
                {
                    'error':
                        'Permission refusée.'
                },
                status=status.HTTP_403_FORBIDDEN
            )


        if (
            request.user.role == 'teacher'
            and collecte.teacher != request.user
        ):

            return Response(
                {
                    'error':
                        'Cette collecte ne vous appartient pas.'
                },
                status=status.HTTP_403_FORBIDDEN
            )


        if collecte.status != 'prepared':

            return Response(
                {
                    'error':
                        'Seules les collectes préparées peuvent être validées.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )


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


        if request.user.role != 'admin_staff':

            return Response(
                {
                    'error':
                        'Seule la scolarité peut publier.'
                },
                status=status.HTTP_403_FORBIDDEN
            )


        if collecte.status != 'validated':

            return Response(
                {
                    'error':
                        'La collecte doit être validée avant publication.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )


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

    permission_classes = [IsAuthenticated]


    def get_queryset(self):

        user = self.request.user

        queryset = StudentNote.objects.all()


        collecte_id = self.request.query_params.get(
            'collecte'
        )

        if collecte_id:

            queryset = queryset.filter(
                collecte_id=collecte_id
            )


        if user.role == 'student':

            queryset = queryset.filter(
                student=user,
                collecte__status='published'
            )


        return queryset