from rest_framework import authentication
from account.models import Account


class DevAuthentication(authentication.BasicAuthentication):

    def authenticate(self, request):
        qs = Account.objects.filter(id=1)
        user = qs.first()
        return (user, None)




