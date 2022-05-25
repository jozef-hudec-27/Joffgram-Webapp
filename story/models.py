from django.db import models
from django.utils import timezone
from django.conf import settings

from datetime import datetime, timedelta

from account.models import Account

import os 


class StoryModelManager(models.Manager):
    def get_queryset(self):
        now = datetime.now() 
        return super(StoryModelManager, self).get_queryset().filter(expiry_date__gte=now)
    
    def expired(self, user_id):
        now = timezone.now()
        return super(StoryModelManager, self).get_queryset().filter(user__id=user_id, expiry_date__lt=now)

def get_story_file_path(self, filename):
    return f'stories/{self.user.id}/story{self.user.my_stories.count() + 1}.{filename.split(".")[-1]}'


class Story(models.Model):
    user = models.ForeignKey(Account, on_delete=models.CASCADE, null=False, blank=False, related_name='my_stories')
    file = models.FileField(null=False, blank=False, max_length=255, upload_to=get_story_file_path)
    created_at = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateTimeField(default=timezone.now() + timedelta(days=1))
    objects = StoryModelManager()

    def is_expired(self):
        return timezone.now() > self.expiry_date

    def permanently_delete(self):
        url = os.path.join(f'{settings.STORIES_ROUTE}/{self.user.id}', self.file.url.split('/')[-1])
        if os.path.exists(url):
            os.remove(url)
        return self.delete()

    def __str__(self) -> str:
        return f"[{self.id}] {self.user.username}'s story"

    class Meta:
        ordering = ['created_at']


    