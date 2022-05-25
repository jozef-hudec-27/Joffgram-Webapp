from django.urls import path

from .views import edit_account_view, account_search_view, acc_detail_view, crop_profile_image, UserPasswordChangeView, password_change_done_view


app_name = 'accounts'

urlpatterns = [
    path('password/done/', password_change_done_view, name='change_password_done'),
    path('password/', UserPasswordChangeView.as_view(template_name='account/password/change.html'), name='change_password'),

    path('search/', account_search_view, name='search'),

    path('<str:user_id>/edit/', edit_account_view, name='edit'),
    path('<str:user_id>/', acc_detail_view, name='acc_detail'),

    path('<str:user_id>/edit/crop-profile-image/', crop_profile_image, name='crop_profile_image'),
]