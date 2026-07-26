from .activity_log import cache_request_payload, try_log_from_middleware


class DashboardActivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        cache_request_payload(request)
        response = self.get_response(request)
        try:
            try_log_from_middleware(request, response)
        except Exception:
            pass
        return response
