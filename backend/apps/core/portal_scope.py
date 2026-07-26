from apps.students.models import Student


def get_portal_students(user):
    if not user or not user.is_authenticated:
        return []
    if getattr(user, 'role', None) == 'STUDENT':
        student = Student.objects.filter(user=user, is_deleted=False).first()
        return [student] if student else []
    if getattr(user, 'role', None) == 'PARENT':
        from apps.parents.models import ParentProfile

        profile = ParentProfile.objects.filter(user=user).first()
        if not profile:
            return []
        return list(profile.students.filter(is_deleted=False))
    return []


def get_portal_grade_levels(user):
    """None = not a portal user (no grade filter). Empty list = portal user with no profile."""
    if getattr(user, 'role', None) not in ('STUDENT', 'PARENT'):
        return None
    levels = sorted(
        {s.grade_level for s in get_portal_students(user) if s and s.grade_level},
    )
    return levels


def portal_may_access_grade(user, grade_level):
    levels = get_portal_grade_levels(user)
    if levels is None:
        return True
    try:
        grade = int(grade_level)
    except (TypeError, ValueError):
        return False
    return grade in levels


def filter_queryset_for_portal(user, queryset, field_name='grade_level'):
    levels = get_portal_grade_levels(user)
    if levels is None:
        return queryset
    if not levels:
        return queryset.none()
    return queryset.filter(**{f'{field_name}__in': levels})
