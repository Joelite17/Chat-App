# accounts/views.py
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.urls import reverse
from django.conf import settings

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics, permissions, status
from .serializers import *

# User = get_user_model()
token_generator = PasswordResetTokenGenerator()

class RegisterAPIView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)


class LoginAPIView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        print(request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            print(token)
            return Response({"detail": "Logged out"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            print("❌ Logout error:", e)
            return Response(status=status.HTTP_400_BAD_REQUEST)

class ForgotPasswordView(generics.GenericAPIView):
    serializer_class = ForgotPasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        # print(serializer)
        if serializer.is_valid():
            print(True)
            result = serializer.save()
            return Response(result, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

 
class ResetPasswordView(generics.GenericAPIView):
    serializer_class = ResetPasswordSerializer

    def post(self, request, uidb64, token, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            result = serializer.save(uidb64=uidb64, token=token)
            return Response(result, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)
    def get_object(self):
        return self.request.user

