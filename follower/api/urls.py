from django.urls import path

from . import views


'''
BASE URL
/api/follows/
'''

app_name = 'api_follows'

urlpatterns = [
    path('remove-follower/', views.remove_follower, name='remove_follower'),
    path('remove-followee/', views.remove_followee, name='remove_followee'),

    path('send-follow-request/', views.send_follow_request, name='send_follow_request'),
    path('accept-or-decline-follow-request/', views.accept_or_decline_follow_request, name='accept_or_decline_follow_request'),
    path('cancel-follow-request/', views.cancel_follow_request, name='cancel_follow_request'),

    path('<str:user_id>/followers/', views.get_user_followers, name='get_user_followers'),
    path('<str:user_id>/following/', views.get_user_following, name='get_user_following'),

]