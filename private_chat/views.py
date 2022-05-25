from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def private_chat_view(request, their_id):
    return render(request, 'private_chat/chat.html', {'user_id': request.user.id, 'path': f'/chat/{their_id}', 'username': request.user.username})
