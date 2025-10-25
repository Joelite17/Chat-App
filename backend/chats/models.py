# chat/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class ChatRoom(models.Model):
    ROOM_TYPES = (
        ('direct', 'Direct Message'),
        ('group', 'Group Chat'),
        ('channel', 'Channel'),
    )
    
    name = models.CharField(max_length=255)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES, default='direct')
    participants = models.ManyToManyField(User, related_name='chat_rooms', blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_rooms')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta: 
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.room_type})"

class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    read_by = models.ManyToManyField(User, related_name='read_messages', blank=True)
    is_edited = models.BooleanField(default=False)
    edited_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.sender.username}: {self.content[:50]}"

class UserStatus(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='chat_status')
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {'Online' if self.is_online else 'Offline'}"

class RoomParticipant(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    is_admin = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['user', 'room']
    
    def __str__(self):
        return f"{self.user.username} in {self.room.name}"