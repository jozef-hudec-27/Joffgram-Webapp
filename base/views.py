from django.shortcuts import render
from django.contrib.auth.decorators import login_required


@login_required
def home_page_view(request):
    return render(request, 'base/home.html', {'username': request.user.username, 'id': request.user.id})

