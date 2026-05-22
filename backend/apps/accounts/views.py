from rest_framework import generics

from rest_framework.permissions import IsAuthenticated

from .permissions import IsAdminRole

from rest_framework.response import Response

from rest_framework.views import APIView


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

    permission_classes = [IsAdminRole]

    def get_queryset(self):

        return User.objects.filter(
            role='student'
        )

class UserListCreateView(generics.ListCreateAPIView):

    queryset = User.objects.all()

    serializer_class = RegisterSerializer

    permission_classes = [IsAdminRole]