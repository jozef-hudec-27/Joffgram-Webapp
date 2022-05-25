from rest_framework import serializers

from .models import Notification
from account.serializers import AccountSerializer


class NotificationSerializer(serializers.ModelSerializer):
    sender = AccountSerializer(read_only=True)
    receiver = AccountSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = ['sender', 'receiver', 'type', 'seen', 'comment_body', 'reply_body', 'story_comment_body', 'post_id', 'created_at']