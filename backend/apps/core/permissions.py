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
            'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'REGISTRAR',
        )


class IsSchoolAdmin(permissions.BasePermission):
    ADMIN_ROLES = ('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'REGISTRAR')

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in self.ADMIN_ROLES


class IsPortalUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('STUDENT', 'PARENT')


class IsStaffMemberOrPortalReadOnly(permissions.BasePermission):
    """Staff: full access. Portal users: GET/HEAD/OPTIONS and selected read-only POST actions."""

    PORTAL_ROLES = ('STUDENT', 'PARENT')
    PORTAL_POST_ACTIONS = frozenset({'ensure_grade_sections'})

    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
        if user.role in self.PORTAL_ROLES:
            if request.method in permissions.SAFE_METHODS:
                return True
            action = getattr(view, 'action', None)
            if request.method == 'POST' and action in self.PORTAL_POST_ACTIONS:
                return True
            return False
        return user.role in IsStaffMember.STAFF_ROLES
