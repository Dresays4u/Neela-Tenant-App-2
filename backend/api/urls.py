from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TenantViewSet, PaymentViewSet, MaintenanceRequestViewSet,
    LegalDocumentViewSet, ListingViewSet
)

router = DefaultRouter()
router.register(r'tenants', TenantViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'maintenance', MaintenanceRequestViewSet)
router.register(r'legal-documents', LegalDocumentViewSet)
router.register(r'listings', ListingViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
