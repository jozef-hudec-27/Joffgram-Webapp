from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from ..models import Account
from ..serializers import AccountDetailSerializer, AccountSerializer
from post.api.views import get_paginated_queryset_response
from post.serializers import PostSerializer
from private_chat.models import PrivateChat, PrivateChatMessage
from private_chat.serializers import PrivateChatMessageSerializer
from notification.serializers import NotificationSerializer

from django.db.models import Q


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_account_detail(request, account_id):
    response = {}
    status = None

    account_qs = Account.objects.filter(id=account_id)

    if not account_qs.exists():
        response['response'] = 'User not found.'
        status = 404
    else:
        account = account_qs.first()
        serializer = AccountDetailSerializer(instance=account, context={'request': request})
        response = serializer.data
        status = 200
    
    return Response(response, status)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_suggested_users(request):
    accounts = Account.objects.order_by('?')
    suggested = []

    for acc in accounts:
        if request.user not in acc.followers.all() and acc != request.user:
            suggested.append(acc)
            if len(suggested) == 50:
                break

    return get_paginated_queryset_response(suggested, request, AccountDetailSerializer, 10, {'request': request})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_saved_posts(request, account_id):
    response = {}
    status = None

    user_qs = Account.objects.filter(id=account_id)
    if not user_qs.exists():
        response['response'] = 'User not found.'
        status = 404
    else:
        user = user_qs.first()

        if user != request.user:
            response['response'] = 'You can only see your own saved posts.'
            status = 403
        else:
            posts = user.saved_posts.all()

            serializer = PostSerializer(instance=posts, many=True, context={'request': request})
            
            response = serializer.data
            status = 200
    
    return Response(response, status=status)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_friends(request): 
    account = request.user
    friends = [user for user in account.followers.all() if account in user.followers.all()]

    serializer = AccountSerializer(instance=friends, many=True)

    return Response(serializer.data, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_unread_messages(request):
    response = {}
    status = None

    account = request.user
    unread_messages = PrivateChatMessage.objects.filter(
        ~Q(user__username=account.username),
        Q(read=False),
        Q(chat__user_a__username=account.username)|
        Q(chat__user_b__username=account.username))
    serializer = PrivateChatMessageSerializer(instance=unread_messages, many=True) 
    response = serializer.data
    status = 200
    
    return Response(response, status)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def read_all_my_unread_messages(request): 
    account = request.user
    unread_messages = PrivateChatMessage.objects.filter(
        ~Q(user__username=account.username),
        Q(read=False),
        Q(chat__user_a__username=account.username)|
        Q(chat__user_b__username=account.username))
    for message in unread_messages:
        message.read = True
        message.save()
    return Response({'response': f'read {unread_messages.count()} messages'}, status=200)




@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def read_my_unread_messages_in_chat(request): 
    response = {}
    status = None

    if not request.data or not request.data.get('theirId'):
        response['response'] = 'Invalid data.'
        status = 400
    else:
        their_id = request.data.get('theirId')
        other_user_qs = Account.objects.filter(id=their_id)

        if not other_user_qs.exists():
            response['response'] = 'Chat not found.'
            status = 400
        else:
            other_user = other_user_qs.first()
            user_a, user_b = sorted([request.user, other_user], key=lambda acc: acc.username)
            private_chat_qs = PrivateChat.objects.filter(user_a=user_a, user_b=user_b, is_active=True)

            if not private_chat_qs.exists():
                response['response'] = 'No chat found.'
                status = 404
            else:
                private_chat = private_chat_qs.first()
                unread_messages = PrivateChatMessage.objects.filter(chat=private_chat, user=other_user, read=False)
                for message in unread_messages:
                    message.read = True
                    message.save()
                response['response'] = f'read {unread_messages.count()} messages'
                status = 200
    return Response(response, status=status)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_my_notifications(request):
    response = {}
    status = None

    account = request.user
    notifications = account.my_received_notifications.filter(seen=False)
    serializer = NotificationSerializer(instance=notifications, many=True) 
    response = serializer.data
    status = 200
        
    return Response(response, status)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_my_notifications(request): 
    account = request.user
    notifications = account.my_received_notifications.filter(seen=False)
    for notification in notifications:
        notification.seen = True
        notification.save()
    [notification.delete() for notification in account.my_received_notifications.filter(seen=True)]
    return Response({'response': f'checked {notifications.count()} notifications'}, status=200)