from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        custom_data = {
            'success': False,
            'error': {
                'code': response.status_code,
                'message': _extract_message(response.data),
                'details': response.data,
            },
        }
        response.data = custom_data
        return response

    return Response(
        {
            'success': False,
            'error': {
                'code': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': 'An unexpected error occurred.',
                'details': str(exc),
            },
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


def _extract_message(data):
    if isinstance(data, dict):
        if 'detail' in data:
            return str(data['detail'])
        for key, value in data.items():
            if isinstance(value, list) and value:
                return f'{key}: {value[0]}'
            return f'{key}: {value}'
    if isinstance(data, list) and data:
        return str(data[0])
    return str(data)
