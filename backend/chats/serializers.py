# chat/serializers.py
from rest_framework import serializers
from .models import ChatRoom, Message, User, UserStatus

class UserSerializer(serializers.ModelSerializer):
    is_online = serializers.BooleanField(source='chat_status.is_online', read_only=True)
    last_seen = serializers.DateTimeField(source='chat_status.last_seen', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_online', 'last_seen']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    read_by = UserSerializer(many=True, read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'content', 'timestamp', 'read_by', 'is_edited', 'edited_at']

class ChatRoomSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'room_type', 'participants', 'created_at', 'last_message', 'unread_count']
    
    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None
     
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.exclude(read_by=request.user).count()
        return 0

class CreateRoomSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    room_type = serializers.ChoiceField(choices=ChatRoom.ROOM_TYPES)
    participant_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )