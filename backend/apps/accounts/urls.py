from django.urls import path

from .views import (
    RegisterView,
    ProfileView,
    TeacherListView,
    StudentListView,
    UserListCreateView,
)

urlpatterns = [

    path(
        'register/',
        RegisterView.as_view(),
    ),

    path(
        'profile/',
        ProfileView.as_view(),
    ),

    path(
        'teachers/',
        TeacherListView.as_view(),
    ),
    path(
        'students/',
        StudentListView.as_view(),
    ),
    path(
        'users/',
        UserListCreateView.as_view(),
    ),
]