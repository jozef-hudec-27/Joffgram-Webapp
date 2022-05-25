from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth import login, authenticate, logout
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.core import files
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import PasswordChangeView
from django.urls import reverse_lazy

from .forms import RegistrationForm, AccountAuthenticationForm, AccountUpdateForm, UserPasswordChangeForm
from .models import Account
from follower.models import FollowRequest
import os, cv2, json, base64

TEMP_PROFILE_IMAGE_NAME = 'temp_profile_image.png'


def register_view(request):
    user = request.user 
    if user.is_authenticated:
        return redirect('home')
    
    context = {}

    if request.POST:
        form = RegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            email = form.cleaned_data.get('email')
            raw_password = form.cleaned_data.get('password1')
            account = authenticate(email=email, password=raw_password)
            login(request, account)
             
            destination = get_redirect_if_exists(request)
            if destination:
                return redirect(destination)
            return redirect('home')
        else:
            context['registration_form'] = form

    return render(request, 'account/register.html', context)

@login_required
def logout_view(request):
    logout(request)
    return redirect('home')


def login_view(request):

    context = {}

    user = request.user
    if user.is_authenticated:
        return redirect('home')
    

    if request.POST:
        form = AccountAuthenticationForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data.get('email')
            password = form.cleaned_data.get('password')
            user = authenticate(email=email, password=password)

            if user:
                login(request, user)
                destination = get_redirect_if_exists(request)
                if destination:
                    return redirect(destination)
                return redirect('home')

        else:
            context['login_form'] = form

    return render(request, 'account/login.html', context)


def get_redirect_if_exists(request):
    redirect = None
    if request.GET:
        if request.GET.get('next'):
            redirect = str(request.GET.get('next'))
    
    return redirect

@login_required
def edit_account_view(request, user_id, *args, **kwargs):
    account_qs = Account.objects.filter(id=user_id)

    if not account_qs.exists():
        return HttpResponse('User does not exist.')
    
    account = account_qs.first()

    if account.id != request.user.id:
        return HttpResponse('You can only edit your profile.')

    context = {}
    
    if request.POST:
        form = AccountUpdateForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            return redirect('home')
        else:
            form = AccountUpdateForm(request.POST, instance=request.user, initial={
                'id': account.id,
                'email': account.email,
                'username': account.username,
                'profile_image': account.profile_image,
                'hide_email': account.hide_email,
                'is_private': account.is_private,
                'bio': account.bio,
                'fullname': account.fullname if account.fullname != None else ''

            })
            context['form'] = form
    else:
        form = AccountUpdateForm(initial={
                'id': account.id,
                'email': account.email,
                'username': account.username,
                'profile_image': account.profile_image,
                'hide_email': account.hide_email,
                'is_private': account.is_private,
                'bio': account.bio,
                'fullname': account.fullname if account.fullname != None else ''

            })
        context['form'] = form
    context['DATA_UPLOAD_MAX_MEMORY_SIZE'] = settings.DATA_UPLOAD_MAX_MEMORY_SIZE
    return render(request, 'account/edit_account.html', context)


@login_required
def account_search_view(request):
    context = {}

    if request.method == 'GET':
        seach_query = request.GET.get('q')
        if len(seach_query) > 0:
            search_results = Account.objects.filter(email__icontains=seach_query, username__icontains=seach_query).distinct()
            user = request.user
            accounts = [
                (account, user in account.followers.all(), FollowRequest.objects.filter(sender=user, receiver=account, is_active=True).exists(),
                FollowRequest.objects.filter(sender=account, receiver=user, is_active=True).exists(), account in user.followers.all())  for account in search_results
            ] 
            context['accounts'] = accounts
            
    return render(request, 'account/search_results.html', context)

@login_required
def acc_detail_view(request, user_id):
    return render(request, 'account/acc_detail.html', {'path': '/accounts/' + user_id, 'user_id': request.user.id})





def save_temp_profile_image_from_base64String(imageString, user):
    INCORRECT_PADDING_EXCEPTION = 'Incorrect padding'
    try:
        if not os.path.exists(settings.TEMP):
            os.mkdir(settings.TEMP)
        if not os.path.exists(f'{settings.TEMP}/{str(user.id)}'):
            os.mkdir(f'{settings.TEMP}/{str(user.id)}')
        url = os.path.join(f'{settings.TEMP}/{user.id}', TEMP_PROFILE_IMAGE_NAME)
        storage = FileSystemStorage(location=url)
        image = base64.b64decode(imageString)
        with storage.open('', 'wb+') as destination:
            destination.write(image)
            destination.close()
        return url
    except Exception as e:
        if str(e) == INCORRECT_PADDING_EXCEPTION:
            imageString += '=' * ((4 - len(imageString) % 4) % 4)
            return save_temp_profile_image_from_base64String(imageString, user)
    return None 

def crop_profile_image(request, user_id):
    payload = {}
    user = request.user
    if request.POST and user.is_authenticated:
        try:
            imageString = request.POST.get('image')

            if imageString:
                url = save_temp_profile_image_from_base64String(imageString, user) 
                img = cv2.imread(url)

                cropX = int(float(str(request.POST.get('cropX'))))
                cropY = int(float(str(request.POST.get('cropY'))))
                cropWidth = int(float(str(request.POST.get('cropWidth'))))
                cropHeight = int(float(str(request.POST.get('cropHeight'))))

                if cropX < 0:
                    cropX = 0
                if cropY < 0:
                    cropY = 0

                crop_img = img[cropY:cropY + cropHeight, cropX:cropX + cropWidth]

                cv2.imwrite(url, crop_img) 

                if user.profile_image.url != '/media/avatar.svg': user.profile_image.delete()

                user.profile_image.save('profile_image.png', files.File(open(url, 'rb')))
                user.save()

                payload['result'] = 'success'
                payload['cropped_profile_image'] = user.profile_image.url

                os.remove(url) 
                
            else:
                pass
        
        except Exception as e:
            payload['result'] = 'error'
            payload['exception'] = str(e)

    return HttpResponse(json.dumps(payload), content_type='application_json')



class UserPasswordChangeView(PasswordChangeView):
    form_class = UserPasswordChangeForm
    success_url = reverse_lazy('accounts:change_password_done')

@login_required
def password_change_done_view(request):
    return render(request, 'account/password/change_done.html')