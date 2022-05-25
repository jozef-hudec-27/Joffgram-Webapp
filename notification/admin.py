from django.contrib import admin
from .models import Notification


class NotificationAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'type', 'seen')
    search_fields = ('id', 'type')
    readonly_fields = ('id', 'created_at')

    filter_horizontal = ()
    list_filter = ()
    fieldsets = ()

admin.site.register(Notification, NotificationAdmin)