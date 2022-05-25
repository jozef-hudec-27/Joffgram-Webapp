from django.urls import path

from . import views


'''
DEFAULT URL
/api/chat/
'''

app_name = 'api_chat'

urlpatterns = [
    path('<str:their_id>/messages/', views.get_private_chat_messages)
]