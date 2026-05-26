from rest_framework import generics

from rest_framework.viewsets import ModelViewSet

from rest_framework.permissions import IsAuthenticated

from rest_framework.response import Response

from rest_framework.views import APIView


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