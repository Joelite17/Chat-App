# chat/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from .models import ChatRoom, Message, UserStatus, RoomParticipant

User = get_user_model()
 
class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        self.user = self.scope['user']

        if self.user.is_anonymous:
            await self.close()
            return

        # Verify user can access this room
        if not await self.is_user_in_room():
            await self.close()
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        
        # Update user status
        await self.update_user_status(True)
        
        # Send room info and recent messages
        await self.send_room_info()
        await self.send_recent_messages()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        
        # Update user status
        if not self.user.is_anonymous:
            await self.update_user_status(False)

    async def receive(self, text_data):
        if self.user.is_anonymous:
            return
 
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type', 'chat_message')
        
        if message_type == 'chat_message':
            await self.handle_chat_message(text_data_json)
        elif message_type == 'typing_start':
            await self.handle_typing_start()
        elif message_type == 'typing_stop':
            await self.handle_typing_stop()
        elif message_type == 'read_receipt':
            await self.handle_read_receipt(text_data_json)

    async def handle_chat_message(self, data):
        message_content = data['message']
        
        # Save message to database
        saved_message = await self.save_message(message_content)
        
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message_id': saved_message.id,
                'sender': self.user.username,
                'sender_id': self.user.id,
                'content': saved_message.content,
                'timestamp': saved_message.timestamp.isoformat(),
                'is_edited': saved_message.is_edited,
            }
        )

    async def handle_typing_start(self):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_typing',
                'user': self.user.username,
                'user_id': self.user.id,
                'typing': True
            }
        )

    async def handle_typing_stop(self):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_typing',
                'user': self.user.username,
                'user_id': self.user.id,
                'typing': False
            }
        )

    async def handle_read_receipt(self, data):
        message_id = data['message_id']
        await self.mark_message_as_read(message_id)
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'read_receipt',
                'message_id': message_id,
                'user': self.user.username,
                'user_id': self.user.id,
            }
        )

    # Handler methods for different message types
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message_id': event['message_id'],
            'sender': event['sender'],
            'sender_id': event['sender_id'],
            'content': event['content'],
            'timestamp': event['timestamp'],
            'is_edited': event['is_edited'],
        }))

    async def user_typing(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_typing',
            'user': event['user'],
            'user_id': event['user_id'],
            'typing': event['typing'],
        }))

    async def read_receipt(self, event):
        await self.send(text_data=json.dumps({
            'type': 'read_receipt',
            'message_id': event['message_id'],
            'user': event['user'],
            'user_id': event['user_id'],
        }))

    async def user_joined(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_joined',
            'user': event['user'],
            'user_id': event['user_id'],
        }))

    async def user_left(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'user': event['user'],
            'user_id': event['user_id'],
        }))

    # Database operations
    @database_sync_to_async
    def is_user_in_room(self):
        return ChatRoom.objects.filter(
            id=int(self.room_name), 
            participants=self.user
        ).exists()

    @database_sync_to_async
    def save_message(self, content):
        room = ChatRoom.objects.get(id=int(self.room_name))
        message = Message.objects.create(
            room=room,
            sender=self.user,
            content=content
        )
        return message

    @database_sync_to_async
    def mark_message_as_read(self, message_id):
        message = Message.objects.get(id=message_id)
        message.read_by.add(self.user)

    @database_sync_to_async
    def update_user_status(self, is_online):
        status, created = UserStatus.objects.get_or_create(user=self.user)
        status.is_online = is_online
        status.save()

    @database_sync_to_async
    def get_room_info(self):
        room = ChatRoom.objects.get(id=int(self.room_name))
        participants = room.participants.all()
        return {
            'room_id': room.id,
            'room_name': room.name,
            'room_type': room.room_type,
            'participants': [
                {
                    'id': user.id,
                    'username': user.username,
                    'is_online': hasattr(user, 'chat_status') and user.chat_status.is_online
                }
                for user in participants
            ]
        }

    @database_sync_to_async
    def get_recent_messages(self, limit=50):
        room = ChatRoom.objects.get(id=int(self.room_name))
        messages = Message.objects.filter(room=room).select_related('sender').order_by('-timestamp')[:limit]
        return [
            {
                'id': msg.id,
                'sender': msg.sender.username,
                'sender_id': msg.sender.id,
                'content': msg.content,
                'timestamp': msg.timestamp.isoformat(),
                'is_edited': msg.is_edited,
                'read_by': [user.id for user in msg.read_by.all()]
            }
            for msg in reversed(messages)
        ]

    async def send_room_info(self):
        room_info = await self.get_room_info()
        await self.send(text_data=json.dumps({
            'type': 'room_info',
            'room': room_info
        }))

    async def send_recent_messages(self):
        messages = await self.get_recent_messages()
        await self.send(text_data=json.dumps({
            'type': 'recent_messages',
            'messages': messages
        }))