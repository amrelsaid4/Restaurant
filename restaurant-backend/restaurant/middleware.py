from django.contrib.sessions.models import Session
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from django.contrib.sessions.backends.db import SessionStore

User = get_user_model()

class SessionKeyMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            # Check for session key in headers
            session_key = request.headers.get('X-Session-Key')
            
            print(f"🔍 Middleware - Session key from header: {session_key}")  # Debug
            print(f"🔍 Middleware - Has user attribute: {hasattr(request, 'user')}")  # Debug
            
            # Make sure request.user exists (should be set by AuthenticationMiddleware)
            if not hasattr(request, 'user'):
                print("❌ Middleware - No user attribute on request")  # Debug
                response = self.get_response(request)
                return response
                
            print(f"🔍 Middleware - Current user authenticated: {request.user.is_authenticated}")  # Debug
            
            if session_key and not request.user.is_authenticated:
                try:
                    session = Session.objects.get(session_key=session_key)
                    session_data = session.get_decoded()
                    user_id = session_data.get('_auth_user_id')
                    
                    print(f"🔍 Middleware - Found session with user_id: {user_id}")  # Debug
                    
                    if user_id:
                        try:
                            user = User.objects.get(id=user_id)
                            request.user = user
                            
                            # Properly restore the session
                            request.session = SessionStore(session_key=session_key)
                            request.session.load()
                            
                            print(f"✅ Session restored from header - User: {user.username}")  # Debug
                        except User.DoesNotExist:
                            print(f"❌ User with id {user_id} not found")  # Debug
                            pass
                except Session.DoesNotExist:
                    print(f"❌ Session with key {session_key} not found")  # Debug
                    pass

            response = self.get_response(request)
            
            # Add session key to response headers if user is authenticated
            if hasattr(request, 'user') and request.user.is_authenticated and hasattr(request, 'session'):
                if hasattr(request.session, 'session_key') and request.session.session_key:
                    response['X-Session-Key'] = request.session.session_key
                    print(f"✅ Adding session key to response: {request.session.session_key}")  # Debug
            
            return response
            
        except Exception as e:
            print(f"💥 Middleware error: {e}")  # Debug
            import traceback
            traceback.print_exc()  # Print full traceback for debugging
            # If middleware fails, continue with normal flow
            response = self.get_response(request)
            return response 