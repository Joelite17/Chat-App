# backend/asgi.py
import os
import django
from django.core.asgi import get_asgi_application

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing code that may import ORM models.
django_asgi_app = get_asgi_application()

# Now import your routing after Django setup
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
import chats.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                chats.routing.websocket_urlpatterns
            )
        )
    ),
})