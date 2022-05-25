from django import forms
from django.contrib.auth.forms import UserCreationForm, PasswordChangeForm
from django.contrib.auth import authenticate

from .models import Account


class RegistrationForm(UserCreationForm):

    email = forms.EmailField(max_length=255, help_text='Required. Add a valid email address.')

    class Meta:
        model = Account
        fields = ['email', 'username', 'password1', 'password2']

    def clean_email(self):
        email = self.cleaned_data['email'].lower()

        account_qs = Account.objects.filter(email=email)
        if not account_qs.exists():
            return email

        raise forms.ValidationError(f'Email {email} is already in use.')

    def clean_username(self):
        username = self.cleaned_data['username']

        account_qs = Account.objects.filter(username=username)
        if not account_qs.exists():
            return username

        raise forms.ValidationError(f'Username {username} is already in use.')


class AccountAuthenticationForm(forms.ModelForm):
    
    password = forms.CharField(label='Password', widget=forms.PasswordInput)

    class Meta:
        model = Account
        fields = ['email', 'password']

    def clean(self):
        if self.is_valid():
            email = self.cleaned_data['email']
            password = self.cleaned_data['password']

            if not authenticate(email=email, password=password):
                raise forms.ValidationError('Invalid Login.')

class AccountUpdateForm(forms.ModelForm):

    class Meta:
        model = Account
        fields = ['username', 'email', 'bio', 'fullname', 'hide_email', 'is_private']

    def clean_email(self):
        email = self.cleaned_data.get('email').lower()
        account_qs = Account.objects.exclude(id=self.instance.id).filter(email=email)

        if not account_qs.exists():
            return email
        raise forms.ValidationError(f'Email {email} is already in use.')

    def clean_username(self):
        username = self.cleaned_data.get('username').lower()
        account_qs = Account.objects.exclude(id=self.instance.id).filter(username=username)

        if not account_qs.exists():
            return username
        raise forms.ValidationError(f'Username {username} is already in use.')

    def save(self, commit=True):
        account = super(AccountUpdateForm, self).save(commit=False)
        account.username = self.cleaned_data.get('username')
        account.email = self.cleaned_data.get('email')
        account.hide_email = self.cleaned_data.get('hide_email')
        account.is_private = self.cleaned_data.get('is_private')
        if commit:
            account.save()
        return account


class UserPasswordChangeForm(PasswordChangeForm):
    old_password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control', 'type': 'password'}))
    new_password1 = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control', 'type': 'password'}))
    new_password2 = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control', 'type': 'password'}))

    class Meta:
        model = Account
        fields = ['old_password', 'new_password1', 'new_password2']