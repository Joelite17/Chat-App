# chat/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count
from .models import ChatRoom, Message, UserStatus
from .serializers import ChatRoomSerializer, MessageSerializer, CreateRoomSerializer, UserSerializer

class ChatRoomViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ChatRoomSerializer
    
    def get_queryset(self):
        return ChatRoom.objects.filter(participants=self.request.user).prefetch_related('participants', 'messages')
    
    def create(self, request):
        serializer = CreateRoomSerializer(data=request.data)
        if serializer.is_valid():
            room = ChatRoom.objects.create(
                name=serializer.validated_data['name'],
                room_type=serializer.validated_data['room_type'],
                created_by=request.user
            )
            
            # Add creator as participant
            room.participants.add(request.user)
            
            # Add other participants if provided
            participant_ids = serializer.validated_data.get('participant_ids', [])
            if participant_ids:
                room.participants.add(*participant_ids)
            
            return Response(ChatRoomSerializer(room, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def add_participant(self, request, pk=None):
        room = self.get_object()
        user_id = request.data.get('user_id')
        
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user = User.objects.get(id=user_id)
            room.participants.add(user)
            return Response({'status': 'participant added'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post']) 
    def leave_room(self, request, pk=None):
        room = self.get_object()
        room.participants.remove(request.user)
        return Response({'status': 'left room'})
    
    @action(detail=True, methods=['post'])
    def mark_all_read(self, request, pk=None):
        room = self.get_object()
        print(room)
        # Verify user is a participant
        if not room.participants.filter(id=request.user.id).exists():
            return Response({'error': 'Not a participant'}, status=status.HTTP_403_FORBIDDEN)
        
        # Mark all unread messages in this room as read for current user
        unread_messages = Message.objects.filter(
            room=room
        ).exclude(read_by=request.user)
        print(unread_messages)
        for message in unread_messages:
            message.read_by.add(request.user)
            
        return Response({'status': 'all messages marked as read'})

class MessageViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer
    
    def get_queryset(self):
        room_id = self.request.query_params.get('room_id')
        if room_id:
            return Message.objects.filter(
                room_id=room_id,
                room__participants=self.request.user
            ).select_related('sender').prefetch_related('read_by')
        return Message.objects.none()
     
    def perform_create(self, serializer):
        room_id = self.request.data.get('room_id')
        room = ChatRoom.objects.get(id=room_id, participants=self.request.user)
        serializer.save(sender=self.request.user, room=room)
     
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        message = self.get_object()
        message.read_by.add(request.user)
        return Response({'status': 'message marked as read'})
    
    
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        room_id = request.query_params.get('room_id')
        if room_id:
            count = Message.objects.filter(
                room_id=room_id,
                room__participants=request.user
            ).exclude(read_by=request.user).count()
            return Response({'unread_count': count})
        return Response({'error': 'room_id required'}, status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    queryset = UserSerializer.Meta.model.objects.all()
    
    def get_queryset(self):
        # Exclude current user and return other users
        return self.queryset.exclude(id=self.request.user.id)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        users = self.get_queryset().filter(
            Q(username__icontains=query) | Q(email__icontains=query)
        )[:10]
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)