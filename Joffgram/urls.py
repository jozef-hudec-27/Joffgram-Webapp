"""Joffgram URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views

from base.views import home_page_view
from account.views import login_view, logout_view, register_view


urlpatterns = [
    path('api/posts/', include('post.api.urls', namespace='api_posts')),
    path('api/accounts/', include('account.api.urls', namespace='api_accounts')),
    path('api/follows/', include('follower.api.urls', namespace='api_follows'),),
    path('api/chat/', include('private_chat.api.urls', namespace='api_chat')),
    path('api/stories/', include('story.api.urls', namespace='api_stories')),


    path('admin/', admin.site.urls),
    path('', home_page_view, name='home'),

    path('accounts/', include('account.urls', namespace='accounts')),
    path('posts/', include('post.urls', namespace='posts')),
    path('chat/', include('private_chat.urls', namespace='chat')),

    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('register/', register_view, name='register'),


    path('reset_password/', auth_views.PasswordResetView.as_view(template_name='account/password/reset.html'),
        name='reset_password'), 

    path('reset_password_sent/', auth_views.PasswordResetDoneView.as_view(template_name='account/password/reset_sent.html'),
        name='password_reset_done'), 

    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(template_name='account/password/reset_form.html'),
        name='password_reset_confirm'), 

    path('reset_password_complete/', auth_views.PasswordResetCompleteView.as_view(template_name='account/password/reset_done.html'),
        name='password_reset_complete'), 
]




if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)