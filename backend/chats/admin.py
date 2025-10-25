# chat/admin.py
from django.contrib import admin
from .models import *
# Basic registration
admin.site.register(ChatRoom)
admin.site.register(Message)
admin.site.register(UserStatus)
admin.site.register(RoomParticipant)