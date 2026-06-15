from django.urls import path

from rest_framework.routers import DefaultRouter

from .views import (
    RegisterView,
    ProfileView,
    TeacherListView,
    StudentListView,
    UserViewSet,
    ImportStudentsView,
    ChangePasswordView
)


router = DefaultRouter()

router.register(
    'users',
    UserViewSet,
    basename='users'
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
    "students/import/",
    ImportStudentsView.as_view(),
    ),
    path(
    'change-password/',
    ChangePasswordView.as_view(),
    ),
]

urlpatterns += router.urls