from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):

    def has_permission(
        self,
        request,
        view
    ):

        return (
            request.user.is_authenticated
            and request.user.role == 'admin_staff'
        )


class IsTeacherRole(BasePermission):

    def has_permission(
        self,
        request,
        view
    ):

        return (
            request.user.is_authenticated
            and
            request.user.role == 'teacher'
        )

class IsStudentRole(BasePermission):

    def has_permission(
        self,
        request,
        view
    ):

        return (
            request.user.is_authenticated
            and request.user.role == 'student'
        )