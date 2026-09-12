from rest_framework.viewsets import ModelViewSet

from rest_framework.decorators import action

from rest_framework.response import Response

from rest_framework import status
from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
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
    @action(
        detail=True,
        methods=['post']
    )
    def open_rattrapage(self, request, pk=None):

        collecte = self.get_object()

        
        if request.user.role != 'admin_staff':
            return Response(
                {
                    'error': 'Seule la scolarité peut ouvrir le rattrapage.'
                },
                status=status.HTTP_403_FORBIDDEN
            )


        if collecte.status != 'published':
            return Response(
                {
                    'error':
                        'Le rattrapage ne peut être ouvert '
                        'que pour une collecte publiée.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        if collecte.rattrapage_status != 'closed':
            return Response(
                {
                    'error':
                        'Le rattrapage a déjà été ouvert '
                        'ou traité.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        collecte.rattrapage_status = 'opened'
        collecte.save(update_fields=['rattrapage_status'])

        return Response(
            {
                'message':
                    'Rattrapage ouvert avec succès.'
            },
            status=status.HTTP_200_OK
        )
    @action(detail=True, methods=['post'])
    def save_rattrapage(self, request, pk=None):
        collecte = self.get_object()

        
        if request.user.role != 'teacher':
            return Response(
                {'error': 'Seul l’enseignant peut saisir les notes de rattrapage.'},
                status=403
            )

        if collecte.teacher != request.user:
            return Response(
                {'error': 'Cette collecte ne vous appartient pas.'},
                status=403
            )

        
        if collecte.status != 'published':
            return Response(
                {'error': 'Le rattrapage ne peut être saisi que pour une collecte publiée.'},
                status=400
            )

       
        if collecte.rattrapage_status != 'opened':
            return Response(
                {'error': 'Le rattrapage n’est pas ouvert.'},
                status=400
            )

        notes_data = request.data.get('notes', [])

        if not isinstance(notes_data, list):
            return Response(
                {'error': 'Format des notes invalide.'},
                status=400
            )

        for item in notes_data:

            student_id = item.get('student')
            rattrapage = item.get('rattrapage')

            if not student_id:
                continue

            if rattrapage in ['', None]:
                continue

            try:
                rattrapage = float(rattrapage)
            except (TypeError, ValueError):
                return Response(
                    {'error': 'Une note de rattrapage est invalide.'},
                    status=400
                )

            if rattrapage < 0 or rattrapage > 20:
                return Response(
                    {'error': 'Les notes de rattrapage doivent être comprises entre 0 et 20.'},
                    status=400
                )

            try:
                student_note = StudentNote.objects.get(
                    collecte=collecte,
                    student_id=student_id
                )
            except StudentNote.DoesNotExist:
                return Response(
                    {
                        'error': f'Aucune note existante pour l’étudiant {student_id}.'
                    },
                    status=400
                )


            student_note.rattrapage = rattrapage
            student_note.save(update_fields=['rattrapage'])

        return Response(
            {'message': 'Notes de rattrapage enregistrées avec succès.'},
            status=200
        )
    @action(detail=True, methods=['post'])
    def validate_rattrapage(self, request, pk=None):

        collecte = self.get_object()

        # Only the teacher assigned to this collecte can validate
        if request.user.role != 'teacher':
            return Response(
                {
                    'error':
                        'Seul l’enseignant peut valider le rattrapage.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if collecte.teacher != request.user:
            return Response(
                {
                    'error':
                        'Cette collecte ne vous appartient pas.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # The normal collecte must already be published
        if collecte.status != 'published':
            return Response(
                {
                    'error':
                        'Le rattrapage ne peut être validé que pour une collecte publiée.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Rattrapage must currently be opened
        if collecte.rattrapage_status != 'opened':
            return Response(
                {
                    'error':
                        'Le rattrapage doit être ouvert avant validation.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Only change the rattrapage workflow status.
        # Do NOT modify any StudentNote or note_finale.
        collecte.rattrapage_status = 'validated'

        collecte.save(
            update_fields=['rattrapage_status']
        )

        return Response(
            {
                'message':
                    'Rattrapage validé avec succès.'
            },
            status=status.HTTP_200_OK
        )
    @action(detail=True, methods=['post'])
    def publish_rattrapage(self, request, pk=None):

        collecte = self.get_object()

        # Only administration can publish the rattrapage
        if request.user.role != 'admin_staff':
            return Response(
                {
                    'error':
                        'Seule la scolarité peut publier le rattrapage.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # The normal collecte must already be published
        if collecte.status != 'published':
            return Response(
                {
                    'error':
                        'Le rattrapage ne peut être publié que pour une collecte publiée.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # The teacher must have validated the rattrapage first
        if collecte.rattrapage_status != 'validated':
            return Response(
                {
                    'error':
                        'Le rattrapage doit être validé avant publication.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        student_notes = StudentNote.objects.filter(
            collecte=collecte
        )

        try:

            with transaction.atomic():

                for student_note in student_notes:

                    rattrapage = student_note.rattrapage or 0

                    # Only students who have a rattrapage grade
                    # receive the new final calculation.
                    if rattrapage > 0:

                        cc = student_note.controle_continu or 0

                        student_note.note_finale = (
                            (cc * 0.4) +
                            (rattrapage * 0.6)
                        )

                        student_note.save(
                            update_fields=['note_finale']
                        )

                collecte.rattrapage_status = 'published'

                collecte.save(
                    update_fields=['rattrapage_status']
                )

        except Exception as error:

            print("ERREUR PUBLICATION RATTRAPAGE :", error)

            return Response(
                {
                    'error': str(error)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            {
                'message':
                    'Rattrapage publié avec succès.'
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