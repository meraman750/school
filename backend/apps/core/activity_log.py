import json
import re
from calendar import month_name

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()

TRACKED_ROLES = frozenset({
    'FINANCE', 'ACCOUNTANT', 'TEACHER', 'STUDENT', 'PARENT',
})

SKIP_PATH_PREFIXES = (
    '/api/v1/auth/',
    '/api/v1/dashboard/activities/',
    '/api/v1/website/',
    '/api/v1/portal/',
)

SCHOOL_MANAGEMENT_ROOTS = frozenset({
    'finance', 'students', 'teachers', 'academics', 'library', 'documents', 'reports',
})

SENSITIVE_PAYLOAD_KEYS = frozenset({
    'password', 'old_password', 'new_password', 'token', 'refresh', 'access',
    'refresh_token', 'access_token', 'secret', 'authorization',
})

METHOD_ACTION = {
    'POST': 'CREATE',
    'PUT': 'UPDATE',
    'PATCH': 'UPDATE',
    'DELETE': 'DELETE',
}


def actor_display_name(user):
    if not user:
        return 'Unknown user', ''
    name = (user.get_full_name() or '').strip() or user.email or user.username
    return name, user.role or ''


def resolve_user_from_request(request):
    user = getattr(request, 'user', None)
    if user is not None and user.is_authenticated:
        return user
    header = request.META.get('HTTP_AUTHORIZATION') or ''
    if not header.startswith('Bearer '):
        return None
    raw = header.split(' ', 1)[1].strip()
    try:
        token = AccessToken(raw)
        return User.objects.filter(pk=token['user_id']).first()
    except (InvalidToken, TokenError, KeyError):
        return None


def parse_request_payload(request):
    cached = getattr(request, '_activity_payload', None)
    if cached is not None:
        return cached
    if request.method not in ('POST', 'PUT', 'PATCH', 'DELETE'):
        return {}
    content_type = (request.content_type or '').lower()
    if 'json' not in content_type and request.method != 'DELETE':
        return {}
    try:
        raw = request.body.decode('utf-8')[:16384]
        if not raw:
            return {}
        return json.loads(raw)
    except (UnicodeDecodeError, json.JSONDecodeError, AttributeError):
        return {}


def cache_request_payload(request):
    if request.method in ('POST', 'PUT', 'PATCH'):
        request._activity_payload = parse_request_payload(request)


def _resource_id_from_path(path):
    m = re.search(r'/(\d+)/?$', path.rstrip('/'))
    return int(m.group(1)) if m else None


def _sanitize_payload(payload):
    if not isinstance(payload, dict):
        return {}
    out = {}
    for key, value in payload.items():
        if str(key).lower() in SENSITIVE_PAYLOAD_KEYS:
            continue
        if isinstance(value, dict):
            out[key] = _sanitize_payload(value)
        elif isinstance(value, list):
            out[key] = value[:20]
        else:
            s = str(value)
            out[key] = s[:500] if len(s) > 500 else value
    return out


def _student_display(student_id):
    if not student_id:
        return None
    from apps.students.models import Student
    s = Student.objects.filter(pk=student_id, is_deleted=False).first()
    if not s:
        return f'Student #{student_id}'
    name = f'{s.first_name} {s.last_name}'.strip()
    extra = f' — {s.admission_number}' if s.admission_number else ''
    grade = f', Grade {s.grade_level}' if s.grade_level else ''
    section = f' Section {s.section}' if s.section else ''
    return f'{name}{extra}{grade}{section}'


def _teacher_display(teacher_id):
    if not teacher_id:
        return None
    from apps.teachers.models import Teacher
    t = Teacher.objects.filter(pk=teacher_id, is_deleted=False).first()
    if not t:
        return f'Teacher #{teacher_id}'
    name = f'{t.first_name} {t.last_name}'.strip()
    extra = f' — {t.employee_id}' if t.employee_id else ''
    return f'{name}{extra}'


def _month_label(month):
    try:
        return month_name[int(month)]
    except (ValueError, IndexError, TypeError):
        return str(month)


def describe_api_activity(request):
    path = request.path or ''
    method = request.method.upper()
    payload = parse_request_payload(request)
    rel = path.replace('/api/v1/', '', 1) if path.startswith('/api/v1/') else path
    rel = rel.strip('/')
    segments = rel.split('/') if rel else []
    root = segments[0] if segments else 'api'
    action = METHOD_ACTION.get(method, method)

    module = root.replace('-', '_')
    summary = ''
    detail_parts = []
    meta_fields = []

    if root == 'finance' and 'compliance' in segments:
        module = 'finance'
        is_student = 'students' in segments
        year = payload.get('year', '')
        month = payload.get('month', '')
        paid = payload.get('paid')
        paid_label = 'Paid' if paid in (True, 'true', '1', 1) else 'Not paid'
        meta_fields.append({'label': 'Period', 'value': f'{_month_label(month)} {year}'})
        meta_fields.append({'label': 'Status', 'value': paid_label})
        if is_student:
            sid = payload.get('student_id')
            student_label = _student_display(sid)
            summary = f'Confirmed student fee as {paid_label} for {_month_label(month)} {year}'
            if student_label:
                detail_parts.append(student_label)
                meta_fields.append({'label': 'Student', 'value': student_label})
        else:
            tid = payload.get('teacher_id')
            teacher_label = _teacher_display(tid)
            summary = f'Confirmed teacher payroll as {paid_label} for {_month_label(month)} {year}'
            if teacher_label:
                detail_parts.append(teacher_label)
                meta_fields.append({'label': 'Teacher', 'value': teacher_label})
        metadata = _build_metadata(request, meta_fields, payload)
        return module, action, summary, '; '.join(detail_parts), metadata

    if root == 'finance':
        module = 'finance'
        resource = segments[1] if len(segments) > 1 else 'record'
        rid = _resource_id_from_path(path)
        resource_label = resource.replace('-', ' ').title()
        meta_fields.append({'label': 'Finance area', 'value': resource_label})
        if method == 'POST':
            summary = f'Created {resource_label.lower()} record'
        elif method == 'DELETE':
            summary = f'Deleted {resource_label.lower()} record'
        else:
            summary = f'Updated {resource_label.lower()} record'
        if rid:
            detail_parts.append(f'Record #{rid}')
            meta_fields.append({'label': 'Record ID', 'value': str(rid)})
        for key in ('amount', 'total_amount', 'status', 'invoice_number'):
            if payload.get(key) is not None:
                meta_fields.append({'label': key.replace('_', ' ').title(), 'value': str(payload.get(key))})
        metadata = _build_metadata(request, meta_fields, payload)
        return module, action, summary, '; '.join(detail_parts), metadata

    if root == 'students':
        module = 'students'
        rid = _resource_id_from_path(path) or payload.get('student') or payload.get('id')
        student_label = _student_display(rid)
        if method == 'POST':
            summary = 'Added a student record'
        elif method == 'DELETE':
            summary = 'Removed a student record'
        else:
            summary = 'Updated student information'
        if student_label:
            detail_parts.append(student_label)
            meta_fields.append({'label': 'Student', 'value': student_label})
        if payload.get('grade_level'):
            meta_fields.append({'label': 'Grade', 'value': str(payload.get('grade_level'))})
        if payload.get('section'):
            meta_fields.append({'label': 'Section', 'value': str(payload.get('section'))})
        if payload.get('status'):
            meta_fields.append({'label': 'Status', 'value': str(payload.get('status'))})
        metadata = _build_metadata(request, meta_fields, payload)
        return module, action, summary, '; '.join(detail_parts), metadata

    if root == 'teachers':
        module = 'teachers'
        rid = _resource_id_from_path(path)
        teacher_label = _teacher_display(rid)
        if method == 'POST':
            summary = 'Added teacher profile data'
        elif method == 'DELETE':
            summary = 'Removed a teacher record'
        else:
            summary = 'Updated teacher information'
        if teacher_label:
            detail_parts.append(teacher_label)
            meta_fields.append({'label': 'Teacher', 'value': teacher_label})
        if payload.get('status'):
            meta_fields.append({'label': 'Status', 'value': str(payload.get('status'))})
        metadata = _build_metadata(request, meta_fields, payload)
        return module, action, summary, '; '.join(detail_parts), metadata

    if root == 'academics':
        module = 'academics'
        tail = '/'.join(segments[1:]) if len(segments) > 1 else ''
        title = payload.get('title') or payload.get('name')
        if 'grade-items' in segments or 'grade_items' in tail:
            if method == 'POST':
                summary = 'Uploaded academic material'
            elif method == 'DELETE':
                summary = 'Deleted academic material'
            else:
                summary = 'Edited academic material'
            if title:
                detail_parts.append(f'"{title}"')
                meta_fields.append({'label': 'Title', 'value': str(title)})
        elif 'timetable' in segments or 'schedule' in tail:
            summary = 'Updated timetable or schedule'
            meta_fields.append({'label': 'Area', 'value': 'Timetable / schedule'})
        elif 'examination' in segments or 'exam' in tail:
            summary = 'Updated examination data'
            meta_fields.append({'label': 'Area', 'value': 'Examination'})
        else:
            summary = f'School academics update ({tail or "general"})'
        for key in ('grade_level', 'subject', 'subject_id', 'item_type', 'type'):
            if payload.get(key) is not None:
                meta_fields.append({'label': key.replace('_', ' ').title(), 'value': str(payload.get(key))})
        metadata = _build_metadata(request, meta_fields, payload)
        return module, action, summary, '; '.join(detail_parts), metadata

    if root in ('library', 'documents'):
        module = root
        title = payload.get('title') or payload.get('name')
        if method == 'POST':
            summary = f'Added a {root} record'
        elif method == 'DELETE':
            summary = f'Removed a {root} record'
        else:
            summary = f'Updated {root} record'
        if title:
            detail_parts.append(f'"{title}"')
            meta_fields.append({'label': 'Title', 'value': str(title)})
        for key in ('author', 'category', 'document_type', 'isbn'):
            if payload.get(key):
                meta_fields.append({'label': key.replace('_', ' ').title(), 'value': str(payload.get(key))})
        metadata = _build_metadata(request, meta_fields, payload)
        return module, action, summary, '; '.join(detail_parts), metadata

    if root == 'reports':
        module = 'reports'
        summary = 'Saved or updated class report'
        if payload.get('grade_level'):
            detail_parts.append(f"Grade {payload.get('grade_level')}")
            meta_fields.append({'label': 'Grade', 'value': str(payload.get('grade_level'))})
        if payload.get('section'):
            detail_parts.append(f"Section {payload.get('section')}")
            meta_fields.append({'label': 'Section', 'value': str(payload.get('section'))})
        metadata = _build_metadata(request, meta_fields, payload)
        return module, action, summary, '; '.join(detail_parts), metadata

    summary = f'{method.title()} on {root.replace("-", " ")}'
    if segments[1:]:
        detail_parts.append('/'.join(segments[1:]))
        meta_fields.append({'label': 'API section', 'value': '/'.join(segments[1:])})
    metadata = _build_metadata(request, meta_fields, payload)
    return module, action, summary, '; '.join(detail_parts), metadata


def _api_root(request):
    path = request.path or ''
    rel = path.replace('/api/v1/', '', 1) if path.startswith('/api/v1/') else path
    segments = rel.strip('/').split('/')
    return segments[0] if segments else ''


def should_log_request(request, response):
    if not request.path.startswith('/api/v1/'):
        return False
    for prefix in SKIP_PATH_PREFIXES:
        if request.path.startswith(prefix):
            return False
    root = _api_root(request)
    if root not in SCHOOL_MANAGEMENT_ROOTS:
        return False
    status = getattr(response, 'status_code', 0)
    if status < 200 or status >= 300:
        return False
    method = request.method.upper()
    if method in ('GET', 'HEAD', 'OPTIONS'):
        return False
    user = resolve_user_from_request(request)
    if not user or user.role not in TRACKED_ROLES:
        return False
    return True


def record_dashboard_activity(request, user=None, module=None, action=None, summary=None, detail='', metadata=None):
    user = user or resolve_user_from_request(request)
    if not user or user.role not in TRACKED_ROLES:
        return None
    if module is None or summary is None:
        module, action, summary, auto_detail, auto_meta = describe_api_activity(request)
        if not detail:
            detail = auto_detail
        if metadata is None:
            metadata = auto_meta
    if action is None:
        action = METHOD_ACTION.get(request.method.upper(), request.method.upper())
    if metadata is None:
        metadata = _build_metadata(request, [])

    from .models import DashboardActivity

    name, role = actor_display_name(user)
    return DashboardActivity.objects.create(
        user=user,
        actor_name=name,
        actor_role=role,
        actor_email=user.email or '',
        module=module[:64],
        action=action[:32],
        summary=summary[:512],
        detail=detail[:2000] if detail else '',
        metadata=metadata,
        http_method=request.method.upper()[:16],
        path=(request.path or '')[:512],
    )


def try_log_from_middleware(request, response):
    if not should_log_request(request, response):
        return
    record_dashboard_activity(request)
