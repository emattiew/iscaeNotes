from rest_framework.viewsets import ModelViewSet


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