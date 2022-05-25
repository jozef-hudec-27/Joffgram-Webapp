from rest_framework import serializers

from django.conf import settings

from .models import Account
from follower.models import FollowRequest


WEB_DOMAIN = settings.MAIN_DOMAIN

class AccountSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField(read_only=True)
    followers = serializers.SerializerMethodField(read_only=True)
    following = serializers.SerializerMethodField(read_only=True)


    class Meta:
        model = Account
        fields = ['id', 'email', 'username', 'bio', 'fullname', 'date_joined', 'last_login', 'is_admin',
        'is_active', 'is_staff', 'is_superuser', 'profile_image', 'hide_email',
        'is_private', 'followers', 'following']
    
    def get_profile_image(self, obj):
        return WEB_DOMAIN + obj.profile_image.url
    
    def get_followers(self, obj):
        return [
            {'email': user.email, 'username': user.username, 'id': user.id,
            'profile_image': f'{WEB_DOMAIN}{user.profile_image.url}',
            'we_follow_them': obj in user.followers.all()} for user in obj.followers.all()
            ]
    
    def get_following(self, obj):
        return [
            {'email': user.email, 'username': user.username, 'id': user.id,
            'profile_image': f'{WEB_DOMAIN}{user.profile_image.url}',
            'they_follow_us': user in obj.followers.all()} for user in obj.following.all()
            ]

class AccountDetailSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField(read_only=True)
    followers = serializers.SerializerMethodField(read_only=True)
    following = serializers.SerializerMethodField(read_only=True)

    posts = serializers.SerializerMethodField(read_only=True)
    we_follow_them = serializers.SerializerMethodField(read_only=True)
    they_follow_us = serializers.SerializerMethodField(read_only=True)
    is_self = serializers.SerializerMethodField(read_only=True)
    request_status = serializers.SerializerMethodField(read_only=True)
    is_message_allowed = serializers.SerializerMethodField(read_only=True)


    class Meta:
        model = Account
        fields = ['id', 'email', 'username', 'bio', 'fullname', 'date_joined', 'last_login', 'is_admin',
        'is_active', 'is_staff', 'is_superuser', 'profile_image', 'hide_email',
        'is_private', 'followers', 'following', 'we_follow_them', 'they_follow_us', 'is_self', 'request_status', 'is_message_allowed', 'posts']
    
    def get_profile_image(self, obj):
        return WEB_DOMAIN + obj.profile_image.url
    
    def get_followers(self, obj):
        return [
            {'email': user.email, 'username': user.username, 'id': user.id,
            'profile_image': f'{WEB_DOMAIN}{user.profile_image.url}',
            'we_follow_them': obj in user.followers.all()} for user in obj.followers.all()
            ]
    
    def get_following(self, obj):
        return [
            {'email': user.email, 'username': user.username, 'id': user.id,
            'profile_image': f'{WEB_DOMAIN}{user.profile_image.url}',
            'they_follow_us': user in obj.followers.all()} for user in obj.following.all()
            ]

    def get_posts(self, obj):
        return [
            {'id': post.id, 'description': post.description, 'image': None if not post.image else WEB_DOMAIN + post.image.url, 'video': None if not post.video else WEB_DOMAIN + post.video.url,
            'created_at': post.created_at, 'likes': AccountSerializer(post.likes.all(), many=True).data,
            'comments': [
                {'id': comment.id, 'user': AccountSerializer(comment.user).data, 'body': comment.body, 'likes': AccountSerializer(comment.likes, many=True).data,
                'created_at': comment.created_at} 
                for comment in post.comments.all()]}
            for post in obj.my_posts.all()
        ]

    def get_we_follow_them(self, obj):
        return obj in self.context.get('request').user.following.all()
    
    def get_they_follow_us(self, obj):
        return self.context.get('request').user in obj.following.all()

    def get_is_self(self, obj):
        return obj == self.context.get('request').user

    def get_is_message_allowed(self, obj):
        return (obj in self.context.get('request').user.following.all()) and (self.context.get('request').user in obj.following.all())

    # them_sent_you => 1
    # you_sent_them => 2
    # no_requests_sent => 3
    def get_request_status(self, obj):
        user = self.context.get('request').user

        they_sent_us_qs = FollowRequest.objects.filter(sender=obj, receiver=user, is_active=True)
        we_sent_them_qs = FollowRequest.objects.filter(sender=user, receiver=obj, is_active=True)

        if they_sent_us_qs.exists() and we_sent_them_qs.exists():
            return 12
        
        elif they_sent_us_qs.exists():
            return 1
        
        elif we_sent_them_qs.exists():
            return 2
        
        return 3