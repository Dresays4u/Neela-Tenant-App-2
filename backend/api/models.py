from django.db import models
from django.utils import timezone

class Tenant(models.Model):
    STATUS_CHOICES = [
        ('Applicant', 'Applicant'),
        ('Approved', 'Approved'),
        ('Active', 'Active'),
        ('Past', 'Past'),
        ('Eviction Pending', 'Eviction Pending'),
    ]

    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Applicant')
    property_unit = models.CharField(max_length=255)
    lease_start = models.DateField(null=True, blank=True)
    lease_end = models.DateField(null=True, blank=True)
    rent_amount = models.DecimalField(max_digits=10, decimal_places=2)
    deposit = models.DecimalField(max_digits=10, decimal_places=2)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    credit_score = models.IntegerField(null=True, blank=True)
    background_check_status = models.CharField(max_length=50, null=True, blank=True)
    application_data = models.JSONField(null=True, blank=True)
    lease_status = models.CharField(max_length=50, null=True, blank=True)
    signed_lease_url = models.URLField(null=True, blank=True)

    def __str__(self):
        return self.name

class Payment(models.Model):
    STATUS_CHOICES = [
        ('Paid', 'Paid'),
        ('Pending', 'Pending'),
        ('Overdue', 'Overdue'),
        ('Failed', 'Failed'),
    ]
    TYPE_CHOICES = [
        ('Rent', 'Rent'),
        ('Late Fee', 'Late Fee'),
        ('Deposit', 'Deposit'),
        ('Application Fee', 'Application Fee'),
    ]

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    method = models.CharField(max_length=50)
    reference = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.tenant.name} - {self.amount} - {self.status}"

class MaintenanceRequest(models.Model):
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('In Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
        ('Closed', 'Closed'),
    ]
    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Emergency', 'Emergency'),
    ]

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='maintenance_requests')
    category = models.CharField(max_length=50)
    description = models.TextField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Open')
    priority = models.CharField(max_length=50, choices=PRIORITY_CHOICES, default='Medium')
    created_at = models.DateTimeField(default=timezone.now)
    images = models.JSONField(default=list, blank=True)
    updates = models.JSONField(default=list, blank=True)
    assigned_to = models.CharField(max_length=255, null=True, blank=True)
    completion_attachments = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.category} - {self.tenant.name}"

class LegalDocument(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='legal_documents')
    type = models.CharField(max_length=100)
    generated_content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=50)
    delivery_method = models.CharField(max_length=50, null=True, blank=True)
    tracking_number = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.type} - {self.tenant.name}"

class Listing(models.Model):
    title = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    beds = models.IntegerField()
    baths = models.DecimalField(max_digits=4, decimal_places=1)
    sqft = models.IntegerField()
    image = models.URLField()
    description = models.TextField()
    amenities = models.JSONField(default=list)

    def __str__(self):
        return self.title
