from django.db import models
from account.models import Account


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('comment_on_post', 'comment_on_post'),
        ('comment_on_story', 'comment_on_story'),
        ('like_on_post', 'like_on_post'),
        ('follow_request_sent', 'follow_request_sent'),
        ('new_follower', 'new_follower'),
        ('response_on_comment', 'response_on_comment'),
        ('follow_request_accepted', 'follow_request_accepted')
    ]

    sender = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='my_sent_notifications')
    receiver = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='my_received_notifications')
    type =  models.CharField(max_length=50, choices=NOTIFICATION_TYPES, null=False, blank=False)
    seen = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    comment_body = models.CharField(max_length=2200, null=True, blank=True) # in case type == comment_on_post
    reply_body = models.CharField(max_length=500, null=True, blank=True) # in case type == response_on_comment
    story_comment_body = models.CharField(max_length=500, null=True, blank=True) # in case type === comment_on_story

    post_id = models.CharField(max_length=50, null=True, blank=True) # in case type isn't follow_request_sent nor new_follower nor comment_on_story

    class Meta:
        ordering = ['-created_at']
