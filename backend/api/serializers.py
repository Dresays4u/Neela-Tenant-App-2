from rest_framework import serializers
from .models import Tenant, Payment, MaintenanceRequest, LegalDocument, Listing, Property, LeaseTemplate

class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class MaintenanceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceRequest
        fields = '__all__'

class LeaseTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaseTemplate
        fields = '__all__'

class LegalDocumentSerializer(serializers.ModelSerializer):
    pdf_url = serializers.SerializerMethodField()
    
    class Meta:
        model = LegalDocument
        fields = '__all__'
    
    def get_pdf_url(self, obj):
        """Returns the full URL for the PDF file"""
        if obj.pdf_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.pdf_file.url)
            return obj.pdf_file.url
        return None

class ListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Listing
        fields = '__all__'

class PropertySerializer(serializers.ModelSerializer):
    display_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Property
        fields = '__all__'
        read_only_fields = ('display_image',)
    
    def get_display_image(self, obj):
        """Returns the full URL for the image (uploaded file or external URL)"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.image_url
    
    def validate(self, data):
        """Ensure either image file or image_url is provided, not both"""
        image = data.get('image')
        image_url = data.get('image_url')
        
        # If both are being set, prioritize the uploaded file
        if image and image_url:
            data['image_url'] = None  # Clear URL when file is uploaded
        
        return data
