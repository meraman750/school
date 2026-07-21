from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone


@shared_task(bind=True, max_retries=3)
def send_email_task(self, recipient, subject, body, sent_by_id=None):
    from apps.communication.models import EmailLog

    log = EmailLog.objects.create(
        recipient=recipient,
        subject=subject,
        body=body,
        status=EmailLog.Status.PENDING,
        sent_by_id=sent_by_id,
    )
    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient],
            fail_silently=False,
        )
        log.status = EmailLog.Status.SENT
        log.sent_at = timezone.now()
        log.save()
        return {'success': True, 'log_id': log.id}
    except Exception as exc:
        log.status = EmailLog.Status.FAILED
        log.error_message = str(exc)
        log.save()
        raise self.retry(exc=exc, countdown=60)


@shared_task
def send_bulk_email_task(recipients, subject, body, sent_by_id=None):
    results = []
    for recipient in recipients:
        result = send_email_task.delay(recipient, subject, body, sent_by_id)
        results.append(result.id)
    return results
