from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from private_chat.serializers import PrivateChatMessageSerializer
from ..models import PrivateChat
from account.models import Account


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_private_chat_messages(request, their_id):
    response = {}
    status = None

    their_acc_qs = Account.objects.filter(id=their_id)
    if not their_acc_qs.exists():
        response['response'] = 'User not found.'
        status = 404
    else:
        their_acc = their_acc_qs.first()
        user_a, user_b = sorted([their_acc, request.user], key=lambda acc: acc.username)

        private_chat_qs = PrivateChat.objects.filter(user_a=user_a, user_b=user_b, is_active=True)
        if not private_chat_qs.exists():
            response['response'] = 'No chat found.'
            status = 404
        else:
            private_chat = private_chat_qs.first()
            serializer = PrivateChatMessageSerializer(instance=private_chat.chat_messages.all(), many=True)
            response = serializer.data
            status = 200

    return Response(response, status=status)


