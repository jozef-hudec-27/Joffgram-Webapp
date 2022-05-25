from django.db import models
from django.conf import settings


def get_post_image_filepath(self, filename):
    return f'posts/{self.user.id}/{filename}'

class Post(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='my_posts')
    image = models.ImageField(max_length=255, upload_to=get_post_image_filepath, null=True, blank=True)
    video = models.FileField(max_length=255, upload_to=get_post_image_filepath, null=True, blank=True)
    description = models.TextField(max_length=2200, null=True, blank=True, default='')
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"[{self.id}] {self.user.username}'s post"

    class Meta:
        ordering = ['-created_at']

class PostComment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='my_comments')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    body = models.TextField(max_length=2200, null=False, blank=False)
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"[{self.id}] {self.user}: {self.body[:50]}"
    
    class Meta:
        ordering = ['-created_at']

class PostCommentReply(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='my_replies')
    comment = models.ForeignKey(PostComment, on_delete=models.CASCADE, related_name='replies')
    body = models.TextField(max_length=500, null=False, blank=False)
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'[{self.id}] {self.user.username}: {self.body[:50]}'

