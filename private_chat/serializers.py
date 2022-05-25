from rest_framework import serializers

from django.conf import settings

from .models import PrivateChatMessage
from account.serializers import AccountSerializer


class PrivateChatMessageSerializer(serializers.ModelSerializer):
    user = AccountSerializer(read_only=True)
    file = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = PrivateChatMessage
        fields = ['user', 'body', 'created_at', 'file', 'id']

    def get_file(self, obj):
        return None if not obj.file else settings.MAIN_DOMAIN + obj.file.url