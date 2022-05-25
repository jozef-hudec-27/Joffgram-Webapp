from django.urls import path

from . import views


'''
BASE ENDPOINT
/api/accounts/
'''

app_name = 'api_accounts'

urlpatterns = [
    path('suggested-users/', views.get_suggested_users, name='get_suggested_users'),

    path('my-friends/', views.get_my_friends, name='get_my_friends'),

    path('my-unread-messages/', views.get_my_unread_messages, name='get_my_unread_messages'),
    path('read-my-unread-messages/', views.read_all_my_unread_messages, name='read_my_unread_messages'),
    path('read-my-unread-messages-in-chat/', views.read_my_unread_messages_in_chat, name='read_my_unread_messages_in_chat'),

    path('my-notifications/', views.get_all_my_notifications, name='get_all_my_notifications'),
    path('check-my-notifications/', views.check_my_notifications, name='check_my_notifications'),

    path('<str:account_id>/', views.get_account_detail, name='get_account_detail'),
    path('<str:account_id>/saved-posts/', views.get_saved_posts, name='get_saved_posts'),
]