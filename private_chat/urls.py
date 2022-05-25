from django.urls import path

from . import views


app_name = 'chat'

urlpatterns = [
    path('<str:their_id>/', views.private_chat_view, name='private_chat_view')
]