from rest_framework import serializers

from django.conf import settings

from .models import Post, PostComment
from account.serializers import AccountDetailSerializer, AccountSerializer


WEB_DOMAIN = settings.MAIN_DOMAIN

class PostSerializer(serializers.ModelSerializer):
    user = AccountDetailSerializer(read_only=True)
    likes = AccountSerializer(many=True, read_only=True)
    image = serializers.SerializerMethodField(read_only=True)
    video = serializers.SerializerMethodField(read_only=True)
    liked = serializers.SerializerMethodField(read_only=True)
    comments_count = serializers.SerializerMethodField(read_only=True)
    saved = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'user', 'description', 'likes', 'image', 'video', 'created_at', 'liked', 'comments_count', 'saved']

    def get_image(self, obj):
        return None if not obj.image else WEB_DOMAIN + obj.image.url

    def get_video(self, obj):
        return None if not obj.video else WEB_DOMAIN + obj.video.url

    def get_liked(self, obj):
        return self.context.get('request').user in obj.likes.all()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_saved(self, obj):
        return obj in self.context.get('request').user.saved_posts.all()
    
class PostCommentSerializer(serializers.ModelSerializer):
    user = AccountSerializer(read_only=True)
    likes = AccountSerializer(many=True, read_only=True)
    replies = serializers.SerializerMethodField(read_only=True)
    liked = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = PostComment
        fields = ['id', 'user', 'body', 'likes', 'created_at', 'liked', 'replies']

    def get_replies(self, obj):
        return [
            {'id': reply.id, 'user': {'username': reply.user.username, 'id': reply.user.id, 'profile_image': WEB_DOMAIN + reply.user.profile_image.url},
            'body': reply.body, 'created_at': reply.created_at, 'liked': self.context.get('request').user in reply.likes.all(), 'likes': AccountSerializer(reply.likes.all(), many=True).data} 
            for reply in obj.replies.all()
        ]
    
    def get_liked(self, obj):
        return self.context.get('request').user in obj.likes.all()