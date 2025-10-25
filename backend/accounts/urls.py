# accounts/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import *

urlpatterns = [
    path("register/", RegisterAPIView.as_view(), name="register"),
    path("login/", LoginAPIView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/<uidb64>/<token>/", ResetPasswordView.as_view(), name="reset-password"),
    path("profile/", ProfileView.as_view(), name="profile"),
    
    # Add token refresh endpoint
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
