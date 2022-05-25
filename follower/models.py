from django.db import models
from django.conf import settings

from private_chat.models import PrivateChat


class FollowRequest(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_follow_requests') 
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='inbox_follow_requests') 
    is_active = models.BooleanField(blank=True, null=False, default=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.sender.username}'s request to {self.receiver.username}"
    
    def decline(self):
        self.is_active = False
        self.save()

    def cancel(self):
        self.is_active = False
        self.save()

    def accept(self):
        self.receiver.followers.add(self.sender)
        self.sender.following.add(self.receiver)
        self.is_active = False
        self.save()

        if self.sender in self.receiver.following.all():
            user_a, user_b = sorted([self.sender, self.receiver], key=lambda acc: acc.username)
            private_chat_qs = PrivateChat.objects.filter(user_a=user_a, user_b=user_b, is_active=False)
            if private_chat_qs.exists():
                private_chat = private_chat_qs.first()
                private_chat.is_active = True
                private_chat.save()
            else:
                PrivateChat.objects.create(user_a=user_a, user_b=user_b)
            

        

   