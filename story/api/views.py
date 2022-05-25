from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from ..models import Story
from ..serializers import StorySerializer
from account.models import Account
from notification.models import Notification

import os, base64, cv2

from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.core import files

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_stories(request, user_id):
    response = {}
    status = None

    user_qs = Account.objects.filter(id=user_id)
    if not user_qs.exists():
        response['response'] = 'User not found.'
        status = 200
    else:
        user = user_qs.first()

        if (request.user not in user.followers.all()) and request.user != user:
            response['response'] = 'You need to follow a user to get their stories.'
            status = 403
        else:
            stories = user.my_stories.all() 
            serializer = StorySerializer(instance=stories, many=True)
            response = serializer.data
            status = 200

    return Response(response, status=status)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def comment_story(request):
    response = {}
    status = None

    if not request.data or not request.data.get('storyId') or not request.data.get('body'):
        response['response'] = 'Invalid data.'
        status = 400
    else:
        story_id = request.data.get('storyId')
        body = request.data.get('body')

        story_qs = Story.objects.filter(id=story_id)
        if not story_qs.exists():
            response['response'] = 'Story not found.'
            status = 404
        else:
            if len(body) <= 0:
                response['response'] = 'Can not create empty comment.'
                status = 400
            else:
                story = story_qs.first()
                Notification.objects.create(sender=request.user, receiver=story.user, type='comment_on_story', story_comment_body=body)
                response['response'] = 'Successfully commented.'
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

@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def add_story(request):
    response = {}
    status = None
    user = request.user

    expired_stories = Story.objects.expired(user.id)
    [story.permanently_delete() for story in expired_stories]

    if request.data:
        try:
            imageFile = request.data.get('imageFile')
            imageString = request.data.get('image')

            if imageFile and imageString: # we're creating story with an image
                url = save_temp_post_image_from_base64String(imageString, user) # saving temp image to our computer

                img = cv2.imread(url)

                cropX = int(float(str(request.data.get('cropX'))))
                cropY = int(float(str(request.data.get('cropY'))))
                cropWidth = int(float(str(request.data.get('cropWidth'))))
                cropHeight = int(float(str(request.data.get('cropHeight'))))

                if cropX < 0:
                    cropX = 0
                if cropY < 0:
                    cropY = 0

                crop_img = img[cropY:cropY + cropHeight, cropX:cropX + cropWidth]

                cv2.imwrite(url, crop_img) # saving the cropped image to where the temp image used to be

                new_story = Story.objects.create(user=request.user, file=imageFile)

                file_url = os.path.join(f'{settings.STORIES_ROUTE}/{request.user.id}', new_story.file.url.split('/')[-1])

                new_story.file.save(f'story{new_story.id}.png', files.File(open(url, 'rb')))
                new_story.save()

                serializer = StorySerializer(instance=new_story)

                response = serializer.data

                status = 201

                os.remove(url) # removing the cropped image from the place the temp image used to be because we already have it saved elsewhere
                os.remove(file_url) # removing the uncropped photo
            
            else: # we're creating story with a video
                videoFile = request.data.get('videoFile')
                new_story = Story.objects.create(user=request.user, file=videoFile)
                serializer = StorySerializer(instance=new_story)
                response = serializer.data
                status = 201


        except Exception as e:
            response['response'] = 'error'
            response['exception'] = str(e)
            print(str(e))

            status = 400

    return Response(response, status=status)
