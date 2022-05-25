from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def post_detail_view(request, post_id):
    return render(request, 'post/post_detail.html', {'user_id': request.user.id, 'path': f'/posts/{post_id}?t=true'})

@login_required
def explore_view(request):
    return render(request, 'post/explore.html', {'user_id': request.user.id})