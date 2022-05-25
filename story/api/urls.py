from django.urls import path

from . import views


"""
DEFAULT URL
/api/stories/
"""

app_name = 'api_stories'

urlpatterns = [
    path('comment/', views.comment_story, name='comment_story'),
    path('add/', views.add_story, name='add_story'),
    path('<str:user_id>/all/', views.get_user_stories, name='get_user_stories'),
]