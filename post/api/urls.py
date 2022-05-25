from django.urls import path

from . import views


'''
DEFAULT PATH
/api/posts/
'''

app_name = 'api_posts'

urlpatterns = [
    path('all/', views.get_all_posts, name='get_all_posts'),

    path('explore/', views.get_explore_posts, name='get_explore_posts'),

    path('share/', views.share_post, name='share_post'),

    path('create/', views.create_post_new, name='create_post'),

    path('personalized/', views.get_personalized_posts, name='get_personalized_posts'),
    path('like-post-toggle/', views.like_post_toggle, name='like_post_toggle'),


    path('comments/create/', views.create_post_comment, name='create_post_comment'),
    path('comments/like-comment-toggle/', views.like_comment_toggle, name='like_comment_toggle'),
    path('comments/<str:comment_id>/delete/', views.delete_post_comment, name='delete_post_comment'),

    path('comments/reply/', views.create_post_comment_reply, name='create_post_comment_reply'),
    path('comments/reply/like-reply-toggle/', views.like_reply_toggle, name='like_reply_toggle'),
    path('comments/reply/<str:reply_id>/delete/', views.delete_post_comment_reply, name='delete_post_comment_reply'),


    path('<str:post_id>/', views.get_post_detail, name='get_post_detail'),
    path('<str:post_id>/delete/', views.delete_post, name='delete_post'),
    path('<str:post_id>/comments/', views.get_post_comments, name='get_post_comments'),
    path('<str:post_id>/save/', views.save_post, name='save_post'),
    path('<str:post_id>/unsave/', views.unsave_post, name='unsave_post'),

]