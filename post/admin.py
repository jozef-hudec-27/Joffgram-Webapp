from django.contrib import admin

from .models import Post, PostComment, PostCommentReply


admin.site.register(Post)
admin.site.register(PostComment)
admin.site.register(PostCommentReply)
