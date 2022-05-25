from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination

from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.core import files

import os, cv2, base64, random

from account.models import Account
from notification.models import Notification
from ..models import Post, PostComment, PostCommentReply
from ..serializers import PostSerializer, PostCommentSerializer
from account.serializers import AccountSerializer
from private_chat.models import PrivateChat, PrivateChatMessage
from private_chat.serializers import PrivateChatMessageSerializer


def get_paginated_queryset_response(qs, request, serializer_class, page_size, context={}):
    paginator = PageNumberPagination()
    paginator.page_size = page_size
    paginated_qs = paginator.paginate_queryset(qs, request)
    serializer = serializer_class(instance=paginated_qs, many=True, context=context)
    return paginator.get_paginated_response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_posts(request):
    posts = Post.objects.all()
    serializer = PostSerializer(instance=posts, many=True, context={'request': request})
    return Response(serializer.data, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_personalized_posts(request):
    users = [user for user in request.user.following.all()]
    users.append(request.user)
    posts = []
    for user in users:
        for post in user.my_posts.all():
            posts.append(post)
    posts.sort(key=lambda post: -post.id)
    return get_paginated_queryset_response(posts, request, PostSerializer, 20, context={'request': request})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_explore_posts(request):
    accounts = Account.objects.order_by('?')
    posts = []

    for acc in accounts:
        if request.user not in acc.followers.all() and acc != request.user and acc.my_posts.count():
            their_posts = acc.my_posts.all()
            their_explore_posts = []

            for i in range(their_posts.count()):
                if their_posts[i] not in their_explore_posts:
                    their_explore_posts.append(their_posts[i])
                    if len(their_explore_posts) >= 3:
                        break
            
            posts += their_explore_posts
                    
    random.shuffle(posts)
    serializer = PostSerializer(instance=posts, many=True, context={'request': request})
    return Response(serializer.data, status=200)

@api_view(['GET'])
def get_post_detail(request, post_id):
    response = {}
    status = None

    post_qs = Post.objects.filter(id=post_id)

    if not post_qs.exists():
        response['response'] = 'Post not found.'
        status = 404
    else:
        post = post_qs.first()
        serializer = PostSerializer(instance=post, context={'request': request})
        response = serializer.data
        status = 200
    
    return Response(response, status=status)

@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def delete_post(request, post_id):
    response = {}
    status = None

    post_qs = Post.objects.filter(id=post_id)

    if not post_qs.exists():
        response['response'] = 'Post not found.'
        status = 404
    else:
        post = post_qs.first()
        if post.user != request.user:
            response['response'] = 'You can only delete your posts.'
            status = 403
        else:
            url = os.path.join(f'{settings.POSTS_ROUTE}/{request.user.id}', post.image.url.split('/')[-1] if post.image else post.video.url.split('/')[-1])
            os.remove(url)
            post.delete()
            response['response'] = 'Successfully deleted post.'
            status = 200

    return Response(response, status=status)

@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def delete_post_comment(request, comment_id):
    response = {}
    status = None

    comment_qs = PostComment.objects.filter(id=comment_id)

    if not comment_qs.exists():
        response['response'] = 'Comment not found.'
        status = 404
    else:
        comment = comment_qs.first()

        if comment.user != request.user:
            response['response'] = 'You can only delete your comments.'
            status = 403
        else:
            post = comment.post
            comment.delete()
            serializer = PostCommentSerializer(instance=post.comments.all(), many=True, context={'request': request})
            response = serializer.data
            status = 200

    return Response(response, status=status)

@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def delete_post_comment_reply(request, reply_id):
    response = {}
    status = None

    reply_qs = PostCommentReply.objects.filter(id=reply_id)

    if not reply_qs.exists():
        response['response'] = 'Reply not found.'
        status = 404
    else:
        reply = reply_qs.first()

        if reply.user != request.user:
            response['response'] = 'You can only delete your replies.'
            status = 403
        else:
            comment = reply.comment
            reply.delete()
            serializer = PostCommentSerializer(instance=comment, context={'request': request})
            response = serializer.data
            status = 200

    return Response(response, status=status)

@api_view(['GET'])
def get_post_comments(request, post_id):
    response = {}
    status = None

    post_qs = Post.objects.filter(id=post_id)

    if not post_qs.exists():
        response['response'] = 'Post not found.'
        status = 404
    else:
        post = post_qs.first()
        comments = post.comments.all()
        serializer = PostCommentSerializer(instance=comments, many=True, context={'request': request})
        response = serializer.data
        status = 200
    
    return Response(response, status=status)

@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def like_post_toggle(request):
    response = {}
    status = None
    
    action = request.data.get('action')
    if action not in ['like', 'unlike']:
        response['response'] = 'Invalid data.'
        status = 400
    else:
        post_id = request.data.get('post_id')
        post_qs = Post.objects.filter(id=post_id)

        if not post_qs.exists():
            response['response'] = 'Post not found.'
            status = 404
        else:
            post = post_qs.first()
            if action == 'like':
                post.likes.add(request.user)
                if request.user != post.user: Notification.objects.create(sender=request.user, receiver=post.user, type='like_on_post', post_id=post.id)
            elif action == 'unlike':
                post.likes.remove(request.user)
           
            response = PostSerializer(instance=post, context={'request': request}).data
            status = 200

    return Response(response, status=status)

@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def create_post_comment(request):
    response = {}
    status = None
    
    post_id = request.data.get('post_id')
    post_qs = Post.objects.filter(id=post_id)

    if not post_qs.exists():
        response['response'] = 'Post not found.'
        status = 404
    else:
        body = request.data.get('comment_body')
        if not body or len(body) < 1:
            response['response'] = 'Invalid data.'
            status = 400
        else:
            post = post_qs.first()
            new_comment = PostComment.objects.create(user=request.user, post=post, body=body)
            if request.user != post.user: Notification.objects.create(sender=request.user, receiver=post.user, type='comment_on_post', comment_body=body, post_id=post.id)
            serializer = PostCommentSerializer(instance=new_comment, context={'request': request})
            response = serializer.data
            status = 201

    return Response(response, status=status)

@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def like_comment_toggle(request):
    response = {}
    status = None
    
    action = request.data.get('action')
    if action.lower() not in ['like', 'unlike']:
        response['response'] = 'Invalid data.'
        status = 400
    else:
        comment_id = request.data.get('comment_id')
        comment_qs = PostComment.objects.filter(id=comment_id)

        if not comment_qs.exists():
            response['response'] = 'Comment not found.'
            status = 404
        else:
            comment = comment_qs.first()
            if action.lower() == 'like': comment.likes.add(request.user)
            elif action.lower() == 'unlike': comment.likes.remove(request.user)
                       
            response = AccountSerializer(instance=comment.likes.all(), many=True).data
            status = 200

    return Response(response, status=status)

@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def create_post_comment_reply(request):
    response = {}
    status = None
    
    comment_id = request.data.get('comment_id')
    comment_qs = PostComment.objects.filter(id=comment_id)

    if not comment_qs.exists():
        response['response'] = 'Comment not found.'
        status = 404
    else:
        body = request.data.get('reply_body')

        if not body or len(body) < 0:
            response['response'] = 'Invalid data.'
            status = 400
        else:
            comment = comment_qs.first()
            new_reply = PostCommentReply.objects.create(user=request.user, comment=comment, body=body)
            if request.user != comment.user: Notification.objects.create(sender=request.user, receiver=comment.user, type='response_on_comment', reply_body=body, post_id=comment.post.id)
            response = {'id': new_reply.id, 'user': {'username': new_reply.user.username, 'id': new_reply.user.id, 'profile_image': settings.MAIN_DOMAIN + new_reply.user.profile_image.url},
            'body': new_reply.body, 'created_at': new_reply.created_at, 'liked': False, 'likes': []}
            status = 201

    return Response(response, status=status)

@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def like_reply_toggle(request):
    response = {}
    status = None
    
    action = request.data.get('action')
    if action.lower() not in ['like', 'unlike']:
        response['response'] = 'Invalid data.'
        status = 400
    else:
        reply_id = request.data.get('reply_id')
        reply_qs = PostCommentReply.objects.filter(id=reply_id)

        if not reply_qs.exists():
            response['response'] = 'Comment reply not found.'
            status = 404
        else:
            reply = reply_qs.first()
            if action.lower() == 'like': reply.likes.add(request.user)
            elif action.lower() == 'unlike': reply.likes.remove(request.user)
           
            response = AccountSerializer(instance=reply.likes.all(), many=True).data
            status = 200

    return Response(response, status=status)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def save_post(request, post_id):
    response = {}
    status = None

    post_qs = Post.objects.filter(id=post_id)
    if not post_qs.exists():
        response['response'] = 'Post not found.'
        status = 404
    else:
        post = post_qs.first()
        request.user.saved_posts.add(post)

        response['response'] = 'success'
        status = 200
    
    return Response(response, status=status)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unsave_post(request, post_id):
    response = {}
    status = None

    post_qs = Post.objects.filter(id=post_id)
    if not post_qs.exists():
        response['response'] = 'Post not found.'
        status = 404
    else:
        post = post_qs.first()
        request.user.saved_posts.remove(post)

        response['response'] = 'success'
        status = 200
    
    return Response(response, status=status)




TEMP_POST_IMAGE_NAME = 'temp_post_image.png'

def save_temp_post_image_from_base64String(imageString, user):
    INCORRECT_PADDING_EXCEPTION = 'Incorrect padding'
    try:
        if not os.path.exists(settings.TEMP):
            os.mkdir(settings.TEMP)
        if not os.path.exists(f'{settings.TEMP}/{str(user.id)}'):
            os.mkdir(f'{settings.TEMP}/{str(user.id)}')
        url = os.path.join(f'{settings.TEMP}/{user.id}', TEMP_POST_IMAGE_NAME)
        storage = FileSystemStorage(location=url)
        image = base64.b64decode(imageString)
        with storage.open('', 'wb+') as destination:
            destination.write(image)
            destination.close()
        return url
    except Exception as e:
        if str(e) == INCORRECT_PADDING_EXCEPTION:
            imageString += '=' * ((4 - len(imageString) % 4) % 4)
            return save_temp_post_image_from_base64String(imageString, user)
    return None 


@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def create_post_new(request):
    response = {}
    status = None
    user = request.user

    if request.data:
        try:
            imageFile = request.data.get('imageFile')
            imageString = request.data.get('image')

            if imageFile and imageString: # we're creating post with an image
                url = save_temp_post_image_from_base64String(imageString, user) # saving temp image to our computer

                img = cv2.imread(url)

                cropX = int(float(str(request.data.get('cropX'))))
                cropY = int(float(str(request.data.get('cropY'))))
                cropWidth = int(float(str(request.data.get('cropWidth'))))
                cropHeight = int(float(str(request.data.get('cropHeight'))))

                description = request.data.get('description')

                if len(description) > 2200:
                    return Response({'response': 'Invalid data.'}, status=400)

                if cropX < 0:
                    cropX = 0
                if cropY < 0:
                    cropY = 0

                crop_img = img[cropY:cropY + cropHeight, cropX:cropX + cropWidth]

                cv2.imwrite(url, crop_img) # saving the cropped image to where the temp image used to be

                new_post = Post.objects.create(user=request.user, image=imageFile, description=description)

                file_url = os.path.join(f'{settings.POSTS_ROUTE}/{request.user.id}', new_post.image.url.split('/')[-1])

                new_post.image.save(f'post{new_post.id}.png', files.File(open(url, 'rb')))
                new_post.save()

                serializer = PostSerializer(instance=new_post, context={'request': request})

                response = serializer.data

                status = 201

                os.remove(url) # removing the cropped image from the place the temp image used to be because we already have it saved elsewhere
                os.remove(file_url) # removing the uncropped photo
            
            else: # we're creating post with a video
                videoFile = request.data.get('videoFile')
                new_post = Post.objects.create(user=request.user, video=videoFile, description=request.data.get('description'))
                serializer = PostSerializer(instance=new_post, context={'request': request})
                response = serializer.data
                status = 201


        except Exception as e:
            response['response'] = 'error'
            response['exception'] = str(e)
            print(str(e))

            status = 400

    return Response(response, status=status)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def share_post(request):
    response = {}
    status = None
    
    post_id = request.data.get('postId')
    acc_id = request.data.get('accId')
    origin = request.data.get('origin')

    if not post_id or not acc_id or not origin:
        response['response'] = 'Invalid data.'
        status = 400
    else:
        acc_qs = Account.objects.filter(id=acc_id)
        post_qs = Post.objects.filter(id=post_id)

        if not acc_qs.exists() or not post_qs.exists():
            response['response'] = 'Post or Account not found.'
            status = 404
        else:
            acc = acc_qs.first()
            post = post_qs.first()

            user_a, user_b = sorted([request.user, acc], key=lambda usr: usr.username)
            private_chat_qs = PrivateChat.objects.filter(user_a=user_a, user_b=user_b, is_active=True)

            if not private_chat_qs.exists():
                response['response'] = 'Private chat not found.'
                status = 404
            else:
                private_chat = private_chat_qs.first()
                new_message = PrivateChatMessage.objects.create(chat=private_chat, body=f'{origin}/posts/{post.id}/', user=request.user)
                serializer = PrivateChatMessageSerializer(instance=new_message)
                response = serializer.data
                status = 201

    return Response(response, status=status)

