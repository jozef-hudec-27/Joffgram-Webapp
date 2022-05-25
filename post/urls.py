from django.urls import path

from . import views


'''
BASE ENDPOINT
/posts/
'''

app_name = 'post'

urlpatterns = [
    path('explore/', views.explore_view, name='explore_view'),
    path('<str:post_id>/', views.post_detail_view, name='post_detail_view'),
]