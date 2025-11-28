"""
Celery configuration for neela_backend project.
"""
import os
import django
from celery import Celery
from dotenv import load_dotenv
import logging
logger = logging.getLogger(__name__)
from django.conf import settings as django_settings
# Load environment variables from .env file (important for Celery worker)
load_dotenv()

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neela_backend.settings')

# Initialize Django to ensure settings are loaded
django.setup()

app = Celery('neela_backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

email_backend = getattr(django_settings, 'EMAIL_BACKEND', 'not configured')
email_host_user = getattr(django_settings, 'EMAIL_HOST_USER', '')
logger.info(f"Celery worker initialized. Email backend: {email_backend}")
if 'smtp' in email_backend.lower():
    if email_host_user:
        logger.info(f"SMTP configured: {email_host_user}")
    else:
        logger.warning("SMTP backend selected but EMAIL_HOST_USER is not set in Celery worker context")
elif 'console' in email_backend.lower():
    logger.warning("Console email backend is active - emails will be printed to terminal instead of being sent")

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')


# tasks.py
from celery import shared_task
from django.core.mail import send_mail
import logging
logger = logging.getLogger(__name__)

@shared_task
def send_test_email():
    try:
        result = send_mail(
            "Celery Test",
            "This is a test email sent via Celery.",
            "fadahunsipaul@gmail.com",
            ["wahiga8943@bipochub.com"],
            fail_silently=False
        )
        logger.info(f"Email sent successfully, result={result}")
    except Exception as e:
        logger.error(f"Email sending failed: {e}")
