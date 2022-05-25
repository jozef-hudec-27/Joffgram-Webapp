from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from account.serializers import AccountSerializer, AccountDetailSerializer
from account.models import Account
from notification.models import Notification
from private_chat.models import PrivateChat
from ..models import FollowRequest
from ..serializers import FollowRequestSerializer
from post.api.views import get_paginated_queryset_response


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def send_follow_request(request):
    response = {}
    status = None

    receiver_id = request.data.get('receiver_id')
    receiver_qs = Account.objects.filter(id=receiver_id)

    if not receiver_qs.exists():
        response['response'] = 'User not found.'
        status = 404
    else:
        receiver = receiver_qs.first()

        if FollowRequest.objects.filter(sender=request.user, receiver=receiver, is_active=True).exists():
            response['response'] = 'You already sent this user a follow request.'
            status = 400
        else:

            if request.user == receiver:
                response['response'] = 'You cannot send request to yourself.'
                status = 400
            else:
                new_follow_request = FollowRequest.objects.create(sender=request.user, receiver=receiver)

                if not receiver.is_private:
                    new_follow_request.accept()
                    Notification.objects.create(sender=request.user, receiver=receiver, type='new_follower')
                else:
                    Notification.objects.create(sender=request.user, receiver=receiver, type='follow_request_sent')
                
                serializer = FollowRequestSerializer(instance=new_follow_request)
                response = serializer.data
                status = 200

    return Response(response, status=status)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def accept_or_decline_follow_request(request):
    response = {}
    status = None

    action = request.data.get('action')
    if not action or action.lower() not in ['accept', 'decline']:
        response['response'] = 'Invalid data.'
        status = 400
    else:
        sender_id = request.data.get('sender_id')
        sender_qs = Account.objects.filter(id=sender_id)

        if not sender_qs.exists():
            response['response'] = 'User not found.'
            status = 404
        else:
            sender = sender_qs.first()

            follow_req_qs = FollowRequest.objects.filter(sender=sender, receiver=request.user, is_active=True)
            if not follow_req_qs.exists():
                response['response'] = 'No request found.'
                status = 404
            else:
                follow_req = follow_req_qs.first()
                if action.lower() == 'accept':
                    follow_req.accept()
                    Notification.objects.create(sender=request.user, receiver=sender, type='follow_request_accepted')
                elif action.lower() == 'decline':
                    follow_req.decline()
                response['response'] = f"Successfully {'accepted' if action.lower() == 'accept' else 'declined'} follow request."
                status = 200
    
    return Response(response, status=status)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def cancel_follow_request(request):
    response = {}
    status = None

    receiver_id = request.data.get('receiver_id')
    receiver_qs = Account.objects.filter(id=receiver_id)

    if not receiver_qs.exists():
        response['response'] = 'User not found.'
        status = 404
    else:
        receiver = receiver_qs.first()
        
        follow_req_qs = FollowRequest.objects.filter(sender=request.user, receiver=receiver, is_active=True)
        if not follow_req_qs.exists():
            response['response'] = 'No request found.'
            status = 404
        else:
            follow_req = follow_req_qs.first()
            follow_req.cancel()
            response['response'] = 'Successfully cancelled follow request.'
            status = 200

    return Response(response, status=status)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def remove_follower(request):
    response = {}
    status = None

    follower_id = request.data.get('follower_id')
    follower_qs = Account.objects.filter(id=follower_id)

    if not follower_qs.exists():
        response['response'] = 'User not found.'
        status = 404
    else:
        follower = follower_qs.first()

        if not (follower in request.user.followers.all() and request.user in follower.following.all()):
            response['response'] = 'This user does not follow you.'
            status = 400
        else:
            request.user.followers.remove(follower)
            follower.following.remove(request.user)
            serializer = AccountSerializer(instance=request.user.followers.all(), many=True)
            response = serializer.data
            status = 200

            user_a, user_b = sorted([request.user, follower], key=lambda acc: acc.username)
            PrivateChat.objects.get(user_a=user_a, user_b=user_b, is_active=True).close()

    return Response(response, status=status)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def remove_followee(request):
    response = {}
    status = None

    followee_id = request.data.get('followee_id')
    followee_qs = Account.objects.filter(id=followee_id)

    if not followee_qs.exists():
        response['response'] = 'User not found.'
        status = 404
    else:
        followee = followee_qs.first()

        if not (followee in request.user.following.all() and request.user in followee.followers.all()):
            response['response'] = 'You do not follow this user.'
            status = 400
        else:
            request.user.following.remove(followee)
            followee.followers.remove(request.user)
            serializer = AccountSerializer(instance=request.user.following.all(), many=True)
            response = serializer.data
            status = 200

            user_a, user_b = sorted([request.user, followee], key=lambda acc: acc.username)
            PrivateChat.objects.get(user_a=user_a, user_b=user_b, is_active=True).close()

    return Response(response, status=status)

@api_view(['GET'])
def get_user_followers(request, user_id):
    response = {}
    status = None

    account_qs = Account.objects.filter(id=user_id)
    if not account_qs.exists():
        response['response'] = 'User not found.'
        status = 404
    else:
        user = account_qs.first()
        user_followers = user.followers.all()
        return get_paginated_queryset_response(user_followers, request, AccountDetailSerializer, 20, {'request': request})
    
    return Response(response, status=status)

@api_view(['GET'])
def get_user_following(request, user_id):
    response = {}
    status = None

    account_qs = Account.objects.filter(id=user_id)
    if not account_qs.exists():
        response['response'] = 'User not found.'
        status = 404
    else:
        user = account_qs.first()
        user_following = user.following.all()
        return get_paginated_queryset_response(user_following, request, AccountDetailSerializer, 20, {'request': request})
    
    return Response(response, status=status)
