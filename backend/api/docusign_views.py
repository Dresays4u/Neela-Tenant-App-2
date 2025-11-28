"""
DocuSign callback view for handling OAuth consent redirects.
"""

from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .docusign_service import clear_docusign_token_cache
import logging

logger = logging.getLogger(__name__)


@csrf_exempt
@require_http_methods(["GET"])
def docusign_callback(request):
    """
    Handle DocuSign OAuth consent callback.
    
    This endpoint receives the redirect from DocuSign after consent is granted.
    It clears the token cache to force re-authentication with the newly granted consent.
    """
    code = request.GET.get('code', '')
    
    if code:
        logger.info("DocuSign consent callback received - clearing token cache")
        # Clear the token cache so the next API call will get a fresh token with consent
        clear_docusign_token_cache()
        
        # Add a note about waiting for consent propagation
        logger.info("Consent granted. Note: There may be a brief delay (10-30 seconds) before consent is fully propagated.")
        
        # Return a simple success message
        return HttpResponse(
            """
            <html>
            <head><title>DocuSign Consent Granted</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #28a745;">✓ Consent Granted Successfully!</h1>
                <p>Your DocuSign integration has been authorized.</p>
                <p><strong>Important:</strong> Please wait 10-30 seconds for consent to fully propagate, then try the operation again.</p>
                <p>You can now close this window.</p>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    The token cache has been cleared. The next API call will use the newly granted consent.<br>
                    If you still get errors, wait a moment and try again - consent propagation can take up to 30 seconds.
                </p>
            </body>
            </html>
            """,
            content_type='text/html',
            status=200
        )
    else:
        logger.warning("DocuSign callback received without authorization code")
        return HttpResponse(
            """
            <html>
            <head><title>DocuSign Callback</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #dc3545;">⚠ No Authorization Code</h1>
                <p>The callback was received but no authorization code was provided.</p>
                <p>Please try granting consent again.</p>
            </body>
            </html>
            """,
            content_type='text/html',
            status=400
        )

