from rest_framework import serializers

from django.conf import settings

from .models import Story
from account.serializers import AccountSerializer


class StorySerializer(serializers.ModelSerializer):
    user = AccountSerializer(read_only=True)
    file = serializers.SerializerMethodField(read_only=True)
    is_expired = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Story
        fields = ['id', 'user', 'file', 'created_at', 'expiry_date', 'is_expired']

    def get_file(self, obj):
        return None if not obj.file else settings.MAIN_DOMAIN + obj.file.url 
    
    def get_is_expired(self, obj):
        return obj.is_expired()