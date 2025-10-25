# accounts/serializers.py
from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes, force_str, DjangoUnicodeDecodeError
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import check_password


User = get_user_model()
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "password2")
        extra_kwargs = {
            "email": {"required": True},
        }

    def validate_email(self, value):
        """Ensure email is unique"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, data):
        """Ensure both passwords match"""
        if data["password"] != data["password2"]:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return data

    def create(self, validated_data):
        validated_data.pop("password2", None)
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")
        print(email)
        try:
            user = User.objects.get(email=email)
        except:
            raise serializers.ValidationError("Invalid email or password")

        # Check if password matches
        if not check_password(password, user.password):
            raise serializers.ValidationError("Invalid email or password")
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
        }


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user found with this email.")
        return value

    def save(self):
        email = self.validated_data["email"]
        user = User.objects.get(email=email)
        token = PasswordResetTokenGenerator().make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_link = f"http://127.0.0.1:5173/reset-password/{uid}/{token}"  # frontend link

        send_mail(
            subject="Password Reset Request",
            message=f"Click the link to reset your password:\n{reset_link}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False
            
        )
        return {"message": "Password reset link sent to your email."}


class ResetPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError("Passwords do not match.")
        return attrs

    def save(self, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist, DjangoUnicodeDecodeError):
            raise serializers.ValidationError("Invalid or expired reset link.")

        if not PasswordResetTokenGenerator().check_token(user, token):
            raise serializers.ValidationError("Invalid or expired reset token.")

        user.set_password(self.validated_data["password"])
        user.save()
        return {"message": "Password has been reset successfully."}



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email")
