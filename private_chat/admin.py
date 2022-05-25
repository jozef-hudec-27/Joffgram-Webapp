from django.contrib import admin

from .models import PrivateChat, PrivateChatMessage


class PrivateChatMessageAdmin(admin.ModelAdmin):
    list_display = ('chat', 'body', 'user', 'created_at', 'file', 'id', 'read')
    search_fields = ('id', 'body')
    readonly_fields = ('id', 'created_at')

    filter_horizontal = ()
    list_filter = ()
    fieldsets = ()

admin.site.register(PrivateChat)
admin.site.register(PrivateChatMessage, PrivateChatMessageAdmin)