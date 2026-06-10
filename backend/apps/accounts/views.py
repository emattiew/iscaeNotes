import pandas as pd

from apps.notes.models import Filiere
from rest_framework import generics

from rest_framework.viewsets import ModelViewSet

from rest_framework.permissions import IsAuthenticated

from rest_framework.response import Response

from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser

from .permissions import (
    IsAdminRole,
    IsTeacherRole,
)

from .models import User

from .serializers import (
    RegisterSerializer,
    UserListSerializer,
)


class RegisterView(generics.CreateAPIView):

    queryset = User.objects.all()

    serializer_class = RegisterSerializer


class ProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'matricule': user.matricule,
            'filiere': (
                user.filiere.id
                if user.filiere
                else None
            ),
            'filiere_name': (
                user.filiere.code
                if user.filiere
                else None
            ),
        })


class TeacherListView(generics.ListAPIView):

    serializer_class = UserListSerializer

    permission_classes = [IsAdminRole]

    def get_queryset(self):

        return User.objects.filter(
            role='teacher'
        )


class StudentListView(generics.ListAPIView):

    serializer_class = UserListSerializer

    permission_classes = [IsAuthenticated]


    def get_queryset(self):

        user = self.request.user

        queryset = User.objects.filter(
            role='student'
        )


        filiere_id = self.request.query_params.get(
            'filiere'
        )


        if filiere_id:

            queryset = queryset.filter(
                filiere_id=filiere_id
            )


        if user.role == 'admin_staff':

            return queryset


        if user.role == 'teacher':

            teacher_collectes = user.collectes.values_list(
                'filiere_id',
                flat=True
            )

            return queryset.filter(
                filiere_id__in=teacher_collectes
            )


        return User.objects.none()


class UserViewSet(ModelViewSet):

    queryset = User.objects.all()

    serializer_class = RegisterSerializer

    permission_classes = [IsAdminRole]


class ImportStudentsView(APIView):

    permission_classes = [IsAdminRole]
    parser_classes = [MultiPartParser]

    def post(self, request):

        excel_file = request.FILES.get("file")

        if not excel_file:

            return Response(
                {"error": "No file uploaded"},
                status=400
            )

        df = pd.read_excel(excel_file)

        created = 0
        skipped = []

        for _, row in df.iterrows():

            matricule = str(
                row["matricule"]
            ).strip()

            if User.objects.filter(
                matricule=matricule
            ).exists():

                skipped.append(
                    f"{matricule} already exists"
                )

                continue

            try:

                filiere = Filiere.objects.get(
                    code=str(
                        row["filiere"]
                    ).strip()
                )

            except Filiere.DoesNotExist:

                skipped.append(
                    f"{matricule} invalid filiere"
                )

                continue

            password = (
                f"{matricule}ISCAE"
            )

            user = User(
                username=matricule,
                first_name=str(row["first_name"]).strip(),
                last_name=str(row["last_name"]).strip(),
                email=str(row["email"]).strip(),
                matricule=matricule,
                role="student",
                filiere=filiere
            )

            user.set_password(password)

            user.save()

            created += 1

        return Response({
            "created": created,
            "skipped": skipped
        })