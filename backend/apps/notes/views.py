from rest_framework.viewsets import ModelViewSet

from rest_framework.decorators import action

from rest_framework.response import Response

from rest_framework import status
from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.utils import timezone

from apps.accounts.permissions import IsAdminRole

from .models import (
    Module,
    Matiere,
    Filiere,
    CollecteNote,
    StudentNote,
    Reclamation,
    ReclamationPeriod,
)

from .serializers import (
    ModuleSerializer,
    MatiereSerializer,
    FiliereSerializer,
    CollecteNoteSerializer,
    StudentNoteSerializer,
    ReclamationSerializer,
    ReclamationPeriodSerializer,
)


class ModuleViewSet(ModelViewSet):

    queryset = Module.objects.all()

    serializer_class = ModuleSerializer

    permission_classes = [IsAdminRole]



class MatiereViewSet(ModelViewSet):

    queryset = Matiere.objects.all()

    serializer_class = MatiereSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Matiere.objects.all()

    def get_permissions(self):

        if self.action in [
            "list",
            "retrieve"
        ]:

            return [
                IsAuthenticated()
            ]

        return [
            IsAdminRole()
        ]


class FiliereViewSet(ModelViewSet):

    queryset = Filiere.objects.all()

    serializer_class = FiliereSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Filiere.objects.all()

    def get_permissions(self):

        if self.action in [
            "list",
            "retrieve"
        ]:

            return [
                IsAuthenticated()
            ]

        return [
            IsAdminRole()
        ]


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
    
class ReclamationViewSet(ModelViewSet):

    serializer_class = ReclamationSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        user = self.request.user

        if user.role == 'admin_staff':

            return Reclamation.objects.all()

        if user.role == 'teacher':

            return Reclamation.objects.filter(
                student_note__collecte__teacher=user
            )

        if user.role == 'student':

            return Reclamation.objects.filter(
                student=user
            )

        return Reclamation.objects.none()

    def perform_create(self, serializer):

        active_period = (
            ReclamationPeriod.objects.filter(
                is_active=True,
                start_date__lte=timezone.now(),
                end_date__gte=timezone.now()
            ).first()
        )

        if not active_period:

            raise serializers.ValidationError(
                'Les réclamations sont fermées'
            )

        student_note = serializer.validated_data[
            'student_note'
        ]

        if (
            self.request.user.role == 'student'
            and student_note.student != self.request.user
        ):

            raise serializers.ValidationError(
                'Cette note ne vous appartient pas'
            )

        serializer.save(
            student=self.request.user,
            period=active_period
        )

    def update(self, request, *args, **kwargs):

        if request.user.role not in [
            'teacher',
            'admin_staff'
        ]:

            return Response(
                {
                    'error':
                        'Permission refusée'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(
            request,
            *args,
            **kwargs
        )

    def partial_update(
        self,
        request,
        *args,
        **kwargs
    ):

        if request.user.role not in [
            'teacher',
            'admin_staff'
        ]:

            return Response(
                {
                    'error':
                        'Permission refusée'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        reclamation = self.get_object()

        status_value = request.data.get(
            'status'
        )

        teacher_response = request.data.get(
            'teacher_response'
        )

        reclamation.teacher_response = (
            teacher_response
        )

        reclamation.status = (
            status_value
        )

        if status_value == 'accepted':

            cc = request.data.get(
                'controle_continu'
            )

            cf = request.data.get(
                'controle_final'
            )

            note = reclamation.student_note

            if cc is not None:

                note.controle_continu = float(cc)

            if cf is not None:

                note.controle_final = float(cf)

            cc_value = (
                note.controle_continu or 0
            )

            cf_value = (
                note.controle_final or 0
            )

            note.note_finale = (

                cc_value * 0.4

                +

                cf_value * 0.6
            )

            note.save()

        reclamation.save()

        serializer = (
            self.get_serializer(
                reclamation
            )
        )

        return Response(
            serializer.data
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs
    ):

        if request.user.role != 'admin_staff':

            return Response(
                {
                    'error':
                        'Seule la scolarité peut supprimer une réclamation'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(
            request,
            *args,
            **kwargs
        )
    
class ReclamationPeriodViewSet(
    ModelViewSet
):

    queryset = (
        ReclamationPeriod.objects.all()
    )

    serializer_class = (
        ReclamationPeriodSerializer
    )

    permission_classes = [
        IsAdminRole
    ]