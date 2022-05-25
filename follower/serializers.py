from rest_framework import serializers

from .models import FollowRequest
from account.serializers import AccountSerializer


class FollowRequestSerializer(serializers.ModelSerializer):
    sender = AccountSerializer(read_only=True)
    receiver = AccountSerializer(read_only=True)

    class Meta:
        model = FollowRequest
        fields = ['id', 'sender', 'receiver', 'is_active', 'timestamp']