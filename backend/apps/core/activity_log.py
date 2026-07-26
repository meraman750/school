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
    '/api/v1/auth/refresh/',
    '/api/v1/dashboard/activities/',
    '/api/v1/website/',
)

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

    if root == 'auth' and 'login' in segments and method == 'POST':
        module = 'auth'
        action = 'LOGIN'
        summary = 'Signed in to the dashboard'
        return module, action, summary, ''

    if root == 'auth' and 'logout' in segments:
        module = 'auth'
        action = 'LOGOUT'
        summary = 'Signed out of the dashboard'
        return module, action, summary, ''

    if root == 'finance' and 'compliance' in segments:
        module = 'finance'
        is_student = 'students' in segments
        year = payload.get('year', '')
        month = payload.get('month', '')
        paid = payload.get('paid')
        paid_label = 'Paid' if paid in (True, 'true', '1', 1) else 'Not paid'
        if is_student:
            sid = payload.get('student_id')
            summary = f'Set student fee status for {_month_label(month)} {year} to {paid_label}'
            if sid:
                detail_parts.append(f'Student ID {sid}')
        else:
            tid = payload.get('teacher_id')
            summary = f'Set teacher payroll status for {_month_label(month)} {year} to {paid_label}'
            if tid:
                detail_parts.append(f'Teacher ID {tid}')
        return module, action, summary, '; '.join(detail_parts)

    if root == 'finance':
        module = 'finance'
        resource = segments[1] if len(segments) > 1 else 'record'
        rid = _resource_id_from_path(path)
        if method == 'POST':
            summary = f'Created finance {resource.replace("-", " ")}'
        elif method == 'DELETE':
            summary = f'Deleted finance {resource.replace("-", " ")}'
        else:
            summary = f'Updated finance {resource.replace("-", " ")}'
        if rid:
            detail_parts.append(f'Record #{rid}')
        return module, action, summary, '; '.join(detail_parts)

    if root == 'students':
        module = 'students'
        rid = _resource_id_from_path(path) or payload.get('student') or payload.get('id')
        if method == 'POST':
            summary = 'Registered or added a student record'
        elif method == 'DELETE':
            summary = 'Removed a student record'
        else:
            summary = 'Updated student information'
        if rid:
            detail_parts.append(f'Student ID {rid}')
        if payload.get('grade_level'):
            detail_parts.append(f"Grade {payload.get('grade_level')}")
        return module, action, summary, '; '.join(detail_parts)

    if root == 'teachers':
        module = 'teachers'
        rid = _resource_id_from_path(path)
        if method == 'POST':
            summary = 'Added or updated teacher profile data'
        elif method == 'DELETE':
            summary = 'Removed a teacher record'
        else:
            summary = 'Updated teacher information'
        if rid:
            detail_parts.append(f'Teacher ID {rid}')
        return module, action, summary, '; '.join(detail_parts)

    if root == 'academics':
        module = 'academics'
        tail = '/'.join(segments[1:]) if len(segments) > 1 else ''
        if 'grade-items' in segments or 'grade_items' in tail:
            title = payload.get('title') or payload.get('name')
            if method == 'POST':
                summary = 'Uploaded new academic material for a subject'
            elif method == 'DELETE':
                summary = 'Deleted academic material'
            else:
                summary = 'Edited academic material'
            if title:
                detail_parts.append(f'"{title}"')
        elif 'timetable' in segments or 'schedule' in tail:
            summary = 'Changed class or annual timetable'
        elif 'examination' in segments or 'exam' in tail:
            summary = 'Updated examination schedule or results'
        else:
            summary = f'Academics change ({method.lower()} {tail or "data"})'
        return module, action, summary, '; '.join(detail_parts)

    if root in ('library', 'documents'):
        module = root
        title = payload.get('title') or payload.get('name')
        if method == 'POST':
            summary = f'Added a new {root} entry'
        elif method == 'DELETE':
            summary = f'Removed a {root} entry'
        else:
            summary = f'Updated {root} information'
        if title:
            detail_parts.append(f'"{title}"')
        return module, action, summary, '; '.join(detail_parts)

    if root == 'reports':
        module = 'reports'
        summary = 'Saved or updated class report data'
        if payload.get('grade_level'):
            detail_parts.append(f"Grade {payload.get('grade_level')}")
        if payload.get('section'):
            detail_parts.append(f"Section {payload.get('section')}")
        return module, action, summary, '; '.join(detail_parts)

    if root == 'settings':
        module = 'settings'
        summary = 'Changed school settings or profile'
        return module, action, summary, ''

    summary = f'{method.title()} request on {root.replace("-", " ")}'
    if segments[1:]:
        detail_parts.append('/'.join(segments[1:]))
    return module, action, summary, '; '.join(detail_parts)


def should_log_request(request, response):
    if not request.path.startswith('/api/v1/'):
        return False
    for prefix in SKIP_PATH_PREFIXES:
        if request.path.startswith(prefix):
            return False
    if request.path.startswith('/api/v1/auth/login/'):
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


def record_dashboard_activity(request, user=None, module=None, action=None, summary=None, detail=''):
    user = user or resolve_user_from_request(request)
    if not user or user.role not in TRACKED_ROLES:
        return None
    if module is None or summary is None:
        module, action, summary, auto_detail = describe_api_activity(request)
        if not detail:
            detail = auto_detail
    if action is None:
        action = METHOD_ACTION.get(request.method.upper(), request.method.upper())

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
        http_method=request.method.upper()[:16],
        path=(request.path or '')[:512],
    )


def try_log_from_middleware(request, response):
    if not should_log_request(request, response):
        return
    record_dashboard_activity(request)
