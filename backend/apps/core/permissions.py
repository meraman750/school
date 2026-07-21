from rest_framework import permissions


class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'SUPER_ADMIN'


class IsPrincipal(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in (
            'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL',
        )


class IsRegistrar(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in (
            'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'REGISTRAR',
        )


class IsFinanceStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in (
            'SUPER_ADMIN', 'PRINCIPAL', 'FINANCE', 'ACCOUNTANT',
        )


class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in (
            'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER',
        )


class IsStaffMember(permissions.BasePermission):
    STAFF_ROLES = (
        'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'REGISTRAR',
        'FINANCE', 'TEACHER', 'RECEPTIONIST', 'LIBRARIAN', 'ACCOUNTANT',
    )

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in self.STAFF_ROLES


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role in (
            'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL',
        )
