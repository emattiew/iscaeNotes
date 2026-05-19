from rest_framework.viewsets import ModelViewSet

from rest_framework.permissions import IsAuthenticated

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

    permission_classes = [IsAuthenticated]


class MatiereViewSet(ModelViewSet):

    queryset = Matiere.objects.all()

    serializer_class = MatiereSerializer

    permission_classes = [IsAuthenticated]


class FiliereViewSet(ModelViewSet):

    queryset = Filiere.objects.all()

    serializer_class = FiliereSerializer

    permission_classes = [IsAuthenticated]


class CollecteViewSet(ModelViewSet):

    queryset = CollecteNote.objects.all()

    serializer_class = CollecteNoteSerializer

    permission_classes = [IsAuthenticated]

class StudentNoteViewSet(ModelViewSet):

    queryset = StudentNote.objects.all()

    serializer_class = StudentNoteSerializer

    permission_classes = [IsAuthenticated]