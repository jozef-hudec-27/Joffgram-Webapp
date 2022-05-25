from django.db import models
from account.models import Account


class PrivateChat(models.Model):
    user_a = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='my_private_chats_a')
    user_b = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='my_private_chats_b')
    is_active = models.BooleanField(default=True, null=False, blank=False)
    currently_connected_users = models.ManyToManyField(Account)

    def __str__(self) -> str:
        return f'Private chat between {self.user_a} and {self.user_b}'

    def close(self):
        self.is_active = False
        self.save()


def get_message_file_filepath(self, filename):
    return f'messages/{self.chat.user_a.id}w{self.chat.user_b.id}/{filename}'

def get_message_image_filepath(self, filename):
    return f'messages/{self.chat.user_a.id}w{self.chat.user_b.id}/{filename}'

class PrivateChatMessage(models.Model):
    chat = models.ForeignKey(PrivateChat, on_delete=models.CASCADE, related_name='chat_messages', null=False, blank=False)
    body = models.CharField(max_length=500, null=False, blank=True, default='')
    user = models.ForeignKey(Account, on_delete=models.CASCADE, null=False, blank=False, related_name='my_private_chat_messages')
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    file = models.FileField(null=True, blank=True, max_length=255, upload_to=get_message_file_filepath)
    read = models.BooleanField(default=False, blank=False, null=False)

    class Meta:
        ordering = ['-created_at']