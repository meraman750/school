from apps.academics.models import AcademicYear, SchoolClass
from apps.teachers.models import Teacher


def get_teacher_for_user(user):
    if not user or not user.is_authenticated:
        return None
    return Teacher.objects.filter(user=user, is_deleted=False).first()


def get_teacher_assigned_sections(teacher):
    """Return (grade_level, section_name) pairs where teacher is the class teacher (admin assignment)."""
    if not teacher:
        return set()

    academic_year = AcademicYear.objects.filter(is_current=True).first()
    if not academic_year:
        academic_year = AcademicYear.objects.order_by('-start_date').first()

    sections = set()

    class_qs = SchoolClass.objects.filter(is_deleted=False, class_teacher=teacher)
    if academic_year:
        class_qs = class_qs.filter(academic_year=academic_year)
    for school_class in class_qs:
        for section in school_class.sections.filter(is_deleted=False):
            sections.add((school_class.grade_level, section.name))

    return sections


def teacher_can_access_class(user, grade_level, section_name):
    if not user or not getattr(user, 'is_authenticated', False):
        return False
    if getattr(user, 'role', None) != 'TEACHER':
        return True
    teacher = get_teacher_for_user(user)
    if not teacher:
        return False
    try:
        grade_level = int(grade_level)
    except (TypeError, ValueError):
        return False
    section_name = (section_name or '').strip()
    assigned = get_teacher_assigned_sections(teacher)
    for g, s in assigned:
        if g == grade_level and str(s).strip().upper() == section_name.upper():
            return True
    return False
