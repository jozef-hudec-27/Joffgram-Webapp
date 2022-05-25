import json, os, base64
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from account.models import Account 
from django.core import files
from django.conf import settings
from django.core.files.storage import FileSystemStorage

from .models import PrivateChatMessage, PrivateChat
from .serializers import PrivateChatMessageSerializer


TEMP_MESSAGE_FILE_NAME = 'temp_message_file.png'

def save_temp_message_file_from_base64String(fileString, user):
    INCORRECT_PADDING_EXCEPTION = 'Incorrect padding'
    try:
        if not os.path.exists(settings.TEMP):
            os.mkdir(settings.TEMP)
        if not os.path.exists(f'{settings.TEMP}/{str(user.id)}'):
            os.mkdir(f'{settings.TEMP}/{str(user.id)}')
        url = os.path.join(f'{settings.TEMP}/{user.id}', TEMP_MESSAGE_FILE_NAME)
        storage = FileSystemStorage(location=url)
        file = base64.b64decode(fileString)
        with storage.open('', 'wb+') as destination:
            destination.write(file)
            destination.close()
        return url
    except Exception as e:
        if str(e) == INCORRECT_PADDING_EXCEPTION:
            fileString += '=' * ((4 - len(fileString) % 4) % 4)
            return save_temp_message_file_from_base64String(fileString, user)
    return None 

class PrivateChatConsumer(WebsocketConsumer):
    def connect(self):
        self.chat_code = self.scope['url_route']['kwargs']['chat_code']

        id1, id2 = self.chat_code.split('w')
        self.user1, self.user2 = Account.objects.get(id=id1), Account.objects.get(id=id2)
        user_a, user_b = sorted([self.user1, self.user2], key=lambda usr: usr.username)

        self.room_group_name = 'chat_%s' % f'{user_a.id}w{user_b.id}'
        
        private_chat_qs = PrivateChat.objects.filter(user_a=user_a, user_b=user_b, is_active=True)
        if not private_chat_qs.exists():
            return self.disconnect('')
        
        self.private_chat = private_chat_qs.first()
        
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        
        print(f'*** PRIVATE CHAT SOCKET {self.room_group_name} CONNECTED ***')

        self.private_chat.currently_connected_users.add(self.user1)
        self.accept()

    def disconnect(self, close_code):
        self.private_chat.currently_connected_users.remove(self.user1)

        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    def receive(self, text_data): 
        text_data_json = json.loads(text_data)

        message = text_data_json.get('message')
        file = text_data_json.get('file')
        name = text_data_json.get('name')

        removed_message_id = text_data_json.get('message_id')

        if not removed_message_id:
            user = Account.objects.get(username=name)
            receiver_connected = self.private_chat.currently_connected_users.count() == 2
            new_msg = PrivateChatMessage.objects.create(chat=self.private_chat, body=message, user=user, read=True if receiver_connected else False)

            if file:

                extension = text_data_json.get('extension')
    
                url = save_temp_message_file_from_base64String(file, user) # saving temp file to our computer

                new_msg.file.save(f'file{new_msg.id}.{extension}', files.File(open(url, 'rb')))
                new_msg.save()

                os.remove(url)

            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'file': None if not file else settings.MAIN_DOMAIN + new_msg.file.url,
                    'name': name,
                    'message': message,
                    'created_at': new_msg.created_at,
                    'user_id': new_msg.user.id,
                    'user_pfp_url': new_msg.user.profile_image.url,
                    'id': new_msg.id
                }
            )
        else:
            msg = PrivateChatMessage.objects.get(id=removed_message_id)

            if msg.file:
                url = os.path.join(f'{settings.PRIVATE_CHAT_FILES_ROUTE}/{self.private_chat.user_a.id}w{self.private_chat.user_b.id}', msg.file.url.split('/')[-1])
                os.remove(url)
            
            msg.body = ''
            msg.file = None
            msg.save()

            
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name, {
                    'type': 'chat_message',
                    'updated_messages': PrivateChatMessageSerializer(instance=msg.chat.chat_messages.all(), many=True).data
                    }
            )

    def chat_message(self, event):
        message = event.get('message')
        name = event.get('name')
        created_at = event.get('created_at')
        user_id = event.get('user_id')
        user_pfp_url = event.get('user_pfp_url')
        file = event.get('file')
        id = event.get('id')
        
        updated_messages = event.get('updated_messages')
       
        self.send(text_data=json.dumps({
            'message': message,
            'name': name,
            'created_at': str(created_at),
            'user_id': user_id,
            'user_pfp_url': user_pfp_url,
            'file': file,
            'updated_messages': updated_messages,
            'id': id,
            'type': 'private_chat_message'
        }))
