from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.utils.decorators import method_decorator
from django.middleware.csrf import get_token
from django.conf import settings
import stripe
import json
from .models import Category, Dish, Customer, Order, OrderItem, DishRating, Restaurant, AdminProfile
from .serializers import (
    CategorySerializer, DishSerializer, CustomerSerializer,
    OrderSerializer, OrderCreateSerializer, DishRatingSerializer,
    RestaurantSerializer, UserSerializer
)

# Initialize Stripe from settings
try:
    stripe.api_key = settings.STRIPE_SECRET_KEY
    print(f"✅ Stripe key loaded from settings: {stripe.api_key[:20]}...")
except Exception as e:
    print(f"❌ Error setting Stripe key from settings: {e}")
    stripe.api_key = None

# Custom permission class for admin email check
class IsRestaurantAdmin(permissions.BasePermission):
    """
    Custom permission to only allow users with admin email to access admin views.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user has admin profile with valid admin email
        return AdminProfile.is_admin_email(request.user.email) or request.user.is_superuser

# ========================================
# 🎯 CUSTOMER VIEWS (Public & Customer)
# ========================================

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class DishViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Dish.objects.filter(is_available=True)
    serializer_class = DishSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Dish.objects.filter(is_available=True)
        category = self.request.query_params.get('category', None)
        is_vegetarian = self.request.query_params.get('vegetarian', None)
        is_spicy = self.request.query_params.get('spicy', None)
        
        if category is not None:
            queryset = queryset.filter(category_id=category)
        if is_vegetarian is not None:
            queryset = queryset.filter(is_vegetarian=is_vegetarian.lower() == 'true')
        if is_spicy is not None:
            queryset = queryset.filter(is_spicy=is_spicy.lower() == 'true')
            
        return queryset
    
    @action(detail=True, methods=['get'])
    def ratings(self, request, pk=None):
        dish = self.get_object()
        ratings = DishRating.objects.filter(dish=dish)
        serializer = DishRatingSerializer(ratings, many=True)
        return Response(serializer.data)

class RestaurantViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Restaurant.objects.filter(is_active=True)
    serializer_class = RestaurantSerializer
    permission_classes = [AllowAny]

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [AllowAny]  # Changed to handle session authentication manually
    
    def get_queryset(self):
        # Try to get authenticated user
        current_user = self.request.user
        
        # If not authenticated, try session-based authentication
        if not current_user or current_user.is_anonymous:
            session_key = self.request.headers.get('X-Session-Key')
            if session_key:
                try:
                    from django.contrib.sessions.models import Session
                    session = Session.objects.get(session_key=session_key)
                    session_data = session.get_decoded()
                    user_id = session_data.get('_auth_user_id')
                    if user_id:
                        current_user = User.objects.get(id=user_id)
                        print(f"✅ Found user via session for orders: {current_user.username}")
                except Exception as e:
                    print(f"❌ Error finding user for orders: {e}")
                    return Order.objects.none()
        
        # If still no user, return empty
        if not current_user or current_user.is_anonymous:
            return Order.objects.none()
            
        # Get customer and their orders
        try:
            customer = current_user.customer
            orders = Order.objects.filter(customer=customer).order_by('-order_date')
            print(f"✅ Found {orders.count()} orders for user {current_user.username}")
            return orders
        except Customer.DoesNotExist:
            print(f"❌ No customer found for user {current_user.username}")
            return Order.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer
    
    def perform_create(self, serializer):
        customer, created = Customer.objects.get_or_create(
            user=self.request.user,
            defaults={
                'phone': '',
                'address': serializer.validated_data.get('delivery_address', '')
            }
        )
        serializer.save(customer=customer)

@method_decorator(csrf_exempt, name='dispatch')
class DishRatingViewSet(viewsets.ModelViewSet):
    serializer_class = DishRatingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if hasattr(self.request.user, 'customer'):
            return DishRating.objects.filter(customer=self.request.user.customer)
        return DishRating.objects.none()
    
    def perform_create(self, serializer):
        # Debug authentication status
        print(f"User authenticated: {self.request.user.is_authenticated}")
        print(f"User: {self.request.user}")
        print(f"Session key: {self.request.session.session_key}")
        
        customer, created = Customer.objects.get_or_create(
            user=self.request.user,
            defaults={'phone': '', 'address': ''}
        )
        serializer.save(customer=customer)

# ========================================
# 🛡️ ADMIN VIEWS (Staff Only)
# ========================================

class AdminCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]  # Temporarily allow any for testing

class AdminDishViewSet(viewsets.ModelViewSet):
    queryset = Dish.objects.all()
    serializer_class = DishSerializer
    permission_classes = [AllowAny]  # Temporarily allow any for testing
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get dish statistics for admin dashboard"""
        total_dishes = Dish.objects.count()
        available_dishes = Dish.objects.filter(is_available=True).count()
        vegetarian_dishes = Dish.objects.filter(is_vegetarian=True).count()
        spicy_dishes = Dish.objects.filter(is_spicy=True).count()
        
        return Response({
            'total_dishes': total_dishes,
            'available_dishes': available_dishes,
            'vegetarian_dishes': vegetarian_dishes,
            'spicy_dishes': spicy_dishes
        })

class AdminOrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [AllowAny]  # Temporarily allow any for testing
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get order statistics for admin dashboard"""
        from django.db.models import Count, Sum
        
        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status='pending').count()
        delivered_orders = Order.objects.filter(status='delivered').count()
        total_revenue = Order.objects.filter(payment_status='paid').aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        
        # Orders by status
        orders_by_status = Order.objects.values('status').annotate(
            count=Count('id')
        )
        
        return Response({
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'delivered_orders': delivered_orders,
            'total_revenue': float(total_revenue),
            'orders_by_status': list(orders_by_status)
        })
    
    @csrf_exempt
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update order status"""
        # Force CSRF exemption
        setattr(request, '_dont_enforce_csrf_checks', True)
        
        order = self.get_object()
        new_status = request.data.get('status')
        
        if new_status in dict(Order.ORDER_STATUS_CHOICES):
            order.status = new_status
            order.save()
            return Response({'message': 'Order status updated successfully'})
        
        return Response({'error': 'Invalid status'}, status=400)

class AdminCustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [AllowAny]  # Temporarily allow any for testing
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get customer statistics"""
        total_customers = Customer.objects.count()
        customers_with_orders = Customer.objects.filter(order__isnull=False).distinct().count()
        
        return Response({
            'total_customers': total_customers,
            'customers_with_orders': customers_with_orders
        })

class AdminRestaurantViewSet(viewsets.ModelViewSet):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    permission_classes = [IsRestaurantAdmin]

# ========================================
# 🌟 PUBLIC API FUNCTIONS
# ========================================

@api_view(['GET'])
@permission_classes([AllowAny])
def restaurant_info(request):
    """Get basic restaurant information"""
    restaurant = Restaurant.objects.filter(is_active=True).first()
    if restaurant:
        serializer = RestaurantSerializer(restaurant)
        return Response(serializer.data)
    return Response({'message': 'Restaurant information not available'}, status=404)

@api_view(['GET'])
@permission_classes([AllowAny])
def menu_overview(request):
    """Get menu overview with categories and featured dishes"""
    categories = Category.objects.filter(is_active=True)
    featured_dishes = Dish.objects.filter(is_available=True)[:6]
    
    return Response({
        'categories': CategorySerializer(categories, many=True).data,
        'featured_dishes': DishSerializer(featured_dishes, many=True).data
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user"""
    data = request.data
    
    if User.objects.filter(username=data.get('username')).exists():
        return Response({'error': 'Username already exists'}, status=400)
    
    if User.objects.filter(email=data.get('email')).exists():
        return Response({'error': 'Email already exists'}, status=400)
    
    user = User.objects.create_user(
        username=data.get('username'),
        email=data.get('email'),
        password=data.get('password'),
        first_name=data.get('first_name', ''),
        last_name=data.get('last_name', '')
    )
    
    Customer.objects.create(
        user=user,
        phone=data.get('phone', ''),
        address=data.get('address', '')
    )
    
    return Response({'message': 'User created successfully'}, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get current user profile with recent orders"""
    print(f"Profile request - User: {request.user}, Authenticated: {request.user.is_authenticated}")  # Debug
    print(f"Session key: {request.session.session_key}")  # Debug
    
    try:
        customer = request.user.customer
    except Customer.DoesNotExist:
        # Create customer if it doesn't exist
        customer = Customer.objects.create(
            user=request.user,
            phone='',
            address=''
        )
    
    # Get customer data
    customer_serializer = CustomerSerializer(customer)
    customer_data = customer_serializer.data
    
    # Get recent orders (last 10)
    recent_orders = Order.objects.filter(customer=customer).order_by('-order_date')[:10]
    orders_serializer = OrderSerializer(recent_orders, many=True)
    
    # Combine data
    profile_data = customer_data.copy()
    profile_data['orders'] = orders_serializer.data
    
    return Response(profile_data)

# ========================================
# 🎛️ ADMIN DASHBOARD API
# ========================================

@api_view(['GET'])
@permission_classes([AllowAny])  # Temporarily allow any for testing
def admin_dashboard_stats(request):
    """Get comprehensive admin dashboard statistics"""
    from django.db.models import Count, Sum, Avg
    from django.utils import timezone
    from datetime import timedelta
    

    
    # Basic counts
    total_orders = Order.objects.count()
    total_customers = Customer.objects.count()
    total_dishes = Dish.objects.count()
    total_categories = Category.objects.count()
    
    # Revenue stats
    total_revenue = Order.objects.filter(payment_status='paid').aggregate(
        total=Sum('total_amount')
    )['total'] or 0
    
    # Recent stats (last 7 days)
    week_ago = timezone.now() - timedelta(days=7)
    recent_orders = Order.objects.filter(order_date__gte=week_ago).count()
    recent_revenue = Order.objects.filter(
        order_date__gte=week_ago, 
        payment_status='paid'
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    # Order status breakdown
    order_statuses = Order.objects.values('status').annotate(count=Count('id'))
    
    # Top dishes by orders
    top_dishes = OrderItem.objects.values('dish__name').annotate(
        total_ordered=Sum('quantity')
    ).order_by('-total_ordered')[:5]
    
    # Average rating
    avg_rating = DishRating.objects.aggregate(avg=Avg('rating'))['avg'] or 0
    
    return Response({
        'overview': {
            'total_orders': total_orders,
            'total_customers': total_customers,
            'total_dishes': total_dishes,
            'total_categories': total_categories,
            'total_revenue': float(total_revenue),
            'average_rating': round(float(avg_rating), 2)
        },
        'recent_stats': {
            'recent_orders': recent_orders,
            'recent_revenue': float(recent_revenue)
        },
        'order_statuses': list(order_statuses),
        'top_dishes': list(top_dishes)
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    """Get CSRF token for frontend and ensure cookie is set"""
    token = get_token(request)
    response = Response({'csrf_token': token})
    
    # Explicitly set CSRF cookie
    response.set_cookie(
        'csrftoken',
        token,
        max_age=None,
        expires=None,
        path='/',
        domain=None,
        secure=False,
        httponly=False,
        samesite='Lax'
    )
    
    return response

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def customer_login(request):
    """Login function for regular customers, allows login with username or email."""
    from django.contrib.auth import authenticate, login

    identity = request.data.get('identity') # Can be username or email
    password = request.data.get('password')
    
    if not identity or not password:
        return Response({'error': 'Username/Email and password required'}, status=400)
    
    # Try to find user by email first
    try:
        user_by_email = User.objects.get(email=identity)
        username = user_by_email.username
    except User.DoesNotExist:
        username = identity

    # Authenticate user
    user = authenticate(request, username=username, password=password)
    if user:
        # Check if it's not an admin user trying to use customer login
        try:
            if AdminProfile.is_admin_email(user.email):
                return Response({'error': 'Admin users should use admin login'}, status=403)
        except Exception as e:
            # Continue with login if AdminProfile check fails
            pass
        
        login(request, user)
        
        # Force session save
        request.session.save()
        
        response = Response({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_admin': False,
                'is_customer': True
            },
            'session_key': request.session.session_key
        })
        
        # Set CORS headers explicitly
        response['Access-Control-Allow-Credentials'] = 'true'
        response['Access-Control-Allow-Origin'] = 'http://localhost:5176'
        
        return response
    else:
        return Response({'error': 'Invalid credentials'}, status=401)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    """Login function specifically for admin users"""
    from django.contrib.auth import authenticate, login
    
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({'error': 'Email and password required'}, status=400)
    
    # Check if email is registered as admin
    try:
        is_admin = AdminProfile.is_admin_email(email)
        if not is_admin:
            return Response({'error': 'Unauthorized: Not an admin email'}, status=403)
    except Exception as e:
        return Response({'error': 'Admin system error'}, status=500)
    
    # Get user by email
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, status=401)
    
    # Authenticate user
    auth_user = authenticate(request, username=user.username, password=password)
    
    if auth_user:
        login(request, auth_user)
        request.session.save()
        admin_profile = AdminProfile.objects.get(admin_email=email)
        
        response = Response({
            'message': 'Login successful',
            'user': {
                'id': auth_user.id,
                'username': auth_user.username,
                'email': auth_user.email,
                'is_admin': True,
                'is_super_admin': admin_profile.is_super_admin
            },
            'session_key': request.session.session_key
        })
        
        # Set CORS headers explicitly
        response['Access-Control-Allow-Credentials'] = 'true'
        response['Access-Control-Allow-Origin'] = 'http://localhost:5176'
        
        return response
    else:
        return Response({'error': 'Invalid credentials'}, status=401)

@api_view(['GET'])
@permission_classes([AllowAny])
def check_user_type(request):
    """Check if current user is admin or customer"""
    
    if not request.user.is_authenticated:
        return Response({
            'user_id': None,
            'username': None,
            'email': None,
            'is_admin': False,
            'is_customer': False,
            'is_authenticated': False
        })
    
    user = request.user
    is_admin = False
    
    try:
        is_admin = AdminProfile.is_admin_email(user.email)
    except Exception as e:
        pass
    
    response_data = {
        'user_id': user.id,
        'username': user.username,
        'email': user.email,
        'is_admin': is_admin,
        'is_customer': hasattr(user, 'customer'),
        'is_authenticated': True
    }
    
    if is_admin:
        try:
            admin_profile = AdminProfile.objects.get(admin_email=user.email)
            response_data['is_super_admin'] = admin_profile.is_super_admin
        except AdminProfile.DoesNotExist:
            pass
    
    return Response(response_data)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def user_logout(request):
    """Logout function for all users"""
    # Force CSRF exemption
    setattr(request, '_dont_enforce_csrf_checks', True)
    
    from django.contrib.auth import logout
    
    logout(request)
    return Response({'message': 'Logout successful'})

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def submit_rating_simple(request):
    """Simple rating submission without CSRF checks"""
    try:
        print(f"User authenticated: {request.user.is_authenticated}")
        print(f"User: {request.user}")
        print(f"Session key: {request.session.session_key}")
        print(f"Request data: {request.data}")
        
        # Manual authentication check and user finding
        current_user = request.user
        
        # If user not authenticated but we have session info, try to find the user
        if not current_user.is_authenticated or current_user.is_anonymous:
            session_key = request.headers.get('X-Session-Key')
            if session_key:
                try:
                    from django.contrib.sessions.models import Session
                    session = Session.objects.get(session_key=session_key)
                    session_data = session.get_decoded()
                    user_id = session_data.get('_auth_user_id')
                    if user_id:
                        current_user = User.objects.get(id=user_id)
                        print(f"Found user via session: {current_user.username}")
                except:
                    pass
        
        if not current_user or current_user.is_anonymous:
            return Response({'error': 'Authentication required'}, status=401)
        
        data = request.data
        
        # Get or create customer
        customer, created = Customer.objects.get_or_create(
            user=current_user,
            defaults={'phone': '', 'address': ''}
        )
        
        # Create rating
        rating = DishRating.objects.create(
            customer=customer,
            dish_id=data['dish_id'],
            rating=data['rating'],
            comment=data.get('comment', '')
        )
        
        serializer = DishRatingSerializer(rating)
        return Response(serializer.data, status=201)
        
    except Exception as e:
        print(f"Error in submit_rating_simple: {e}")
        return Response({'error': str(e)}, status=400)

@csrf_exempt
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def add_rating(request):
    """Simple rating add function without any middleware issues"""
    try:
        print(f"✅ Rating request received: {request.data}")
        
        data = request.data
        dish_id = data.get('dish_id')
        rating_value = data.get('rating')
        comment = data.get('comment', '')
        
        # Find user by session
        session_key = request.headers.get('X-Session-Key')
        current_user = None
        
        if session_key:
            try:
                from django.contrib.sessions.models import Session
                session = Session.objects.get(session_key=session_key)
                session_data = session.get_decoded()
                user_id = session_data.get('_auth_user_id')
                if user_id:
                    current_user = User.objects.get(id=user_id)
                    print(f"✅ Found user via session: {current_user.username}")
            except Exception as e:
                print(f"❌ Error finding user: {e}")
        
        if not current_user:
            return Response({'error': 'User not found'}, status=401)
        
        # Get or create customer
        customer, created = Customer.objects.get_or_create(
            user=current_user,
            defaults={'phone': '', 'address': ''}
        )
        
        # Always create new rating (allow multiple ratings from same user)
        rating = DishRating.objects.create(
            customer=customer,
            dish_id=dish_id,
            rating=rating_value,
            comment=comment
        )
        
        print(f"✅ Rating created successfully: {rating.id}")
        
        return Response({
            'success': True,
            'rating_id': rating.id,
            'message': 'Rating submitted successfully'
        }, status=201)
        
    except Exception as e:
        print(f"❌ Error in add_rating: {e}")
        return Response({'error': str(e)}, status=400)

@csrf_exempt
@api_view(['PUT'])
@permission_classes([AllowAny])
def update_rating(request, rating_id):
    """Update existing rating"""
    try:
        print(f"✅ Update rating request: {rating_id}, Data: {request.data}")
        
        data = request.data
        rating_value = data.get('rating')
        comment = data.get('comment', '')
        
        # Find user by session
        session_key = request.headers.get('X-Session-Key')
        current_user = None
        
        if session_key:
            try:
                from django.contrib.sessions.models import Session
                session = Session.objects.get(session_key=session_key)
                session_data = session.get_decoded()
                user_id = session_data.get('_auth_user_id')
                if user_id:
                    current_user = User.objects.get(id=user_id)
                    print(f"✅ Found user via session: {current_user.username}")
            except Exception as e:
                print(f"❌ Error finding user: {e}")
        
        if not current_user:
            return Response({'error': 'User not found'}, status=401)
        
        # Get customer
        try:
            customer = Customer.objects.get(user=current_user)
        except Customer.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=404)
        
        # Find and update rating
        try:
            rating = DishRating.objects.get(id=rating_id, customer=customer)
            rating.rating = rating_value
            rating.comment = comment
            rating.save()
            
            print(f"✅ Rating updated successfully: {rating.id}")
            
            return Response({
                'success': True,
                'rating_id': rating.id,
                'message': 'Rating updated successfully'
            }, status=200)
            
        except DishRating.DoesNotExist:
            return Response({'error': 'Rating not found or not owned by user'}, status=404)
        
    except Exception as e:
        print(f"❌ Error in update_rating: {e}")
        return Response({'error': str(e)}, status=400)

# ========================================
# 💳 STRIPE PAYMENT VIEWS
# ========================================

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def create_payment_intent(request):
    """Create Stripe payment intent for checkout"""
    # Force CSRF exemption
    setattr(request, '_dont_enforce_csrf_checks', True)
    
    try:
        print(f"💳 Payment intent request from user: {request.user}")
        print(f"💳 Is authenticated: {request.user.is_authenticated}")
        print(f"💳 Request data: {request.data}")
        
        data = request.data
        amount = int(float(data.get('amount', 0)) * 100)  # Convert to cents
        delivery_address = data.get('delivery_address', '')
        special_instructions = data.get('special_instructions', '')
        items = data.get('items', [])
        
        if amount <= 0:
            return Response({'error': 'Invalid amount'}, status=400)
        
        # DEVELOPMENT BYPASS - Simulate Stripe payment intent and CREATE REAL ORDER
        print(f"🧪 DEVELOPMENT MODE: Simulating payment intent for ${amount/100}")
        
        # Get user
        current_user = request.user
        if not current_user.is_authenticated:
            # Try to get user from session
            session_key = request.headers.get('X-Session-Key')
            if session_key:
                try:
                    from django.contrib.sessions.models import Session
                    session = Session.objects.get(session_key=session_key)
                    session_data = session.get_decoded()
                    user_id = session_data.get('_auth_user_id')
                    if user_id:
                        current_user = User.objects.get(id=user_id)
                        print(f"✅ Found user via session: {current_user.username}")
                except Exception as e:
                    print(f"❌ Error finding user: {e}")
        
        if not current_user or current_user.is_anonymous:
            # For test mode, create a dummy customer
            print("🧪 No authenticated user - creating test customer for demo")
            try:
                # Get or create a test user
                test_user, created = User.objects.get_or_create(
                    username='testuser',
                    defaults={
                        'email': 'test@example.com',
                        'first_name': 'Test',
                        'last_name': 'User'
                    }
                )
                current_user = test_user
                print(f"✅ Using test user: {current_user.username}")
            except Exception as e:
                print(f"❌ Error creating test user: {e}")
                return Response({'error': 'Unable to process test payment'}, status=400)
        
        # Get or create customer
        customer, created = Customer.objects.get_or_create(
            user=current_user,
            defaults={'phone': '', 'address': delivery_address}
        )
        
        # Create order immediately (simulate successful payment)
        order = Order.objects.create(
            customer=customer,
            total_amount=amount / 100,  # Convert from cents
            delivery_address=delivery_address,
            special_instructions=special_instructions,
            status='confirmed',  # Payment confirmed in test mode
            payment_status='paid'  # Mark as paid in test mode
        )
        
        # Create order items
        for item_data in items:
            try:
                dish = Dish.objects.get(id=item_data['dish_id'])
                OrderItem.objects.create(
                    order=order,
                    dish=dish,
                    quantity=item_data['quantity'],
                    price=dish.price,
                    special_instructions=item_data.get('special_instructions', '')
                )
                print(f"✅ Added item: {dish.name} x{item_data['quantity']}")
            except Dish.DoesNotExist:
                print(f"❌ Dish not found: {item_data.get('dish_id')}")
                continue
        
        # Generate a fake payment intent ID for testing
        import uuid
        fake_payment_intent_id = f"pi_test_{str(uuid.uuid4()).replace('-', '')[:24]}"
        fake_client_secret = f"{fake_payment_intent_id}_secret_test"
        
        print(f"✅ TEST ORDER CREATED: Order #{order.id} for user {current_user.username}")
        print(f"✅ Simulated payment intent created: {fake_payment_intent_id}")
        
        return Response({
            'client_secret': fake_client_secret,
            'payment_intent_id': fake_payment_intent_id,
            'order_id': order.id,
            'test_mode': True,
            'message': f'Test order #{order.id} created successfully! No real money charged.'
        })
        
    except Exception as e:
        print(f"❌ Error creating payment intent: {e}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=400)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def confirm_payment_and_create_order(request):
    """Confirm payment and create order in database"""
    # Force CSRF exemption
    setattr(request, '_dont_enforce_csrf_checks', True)
    
    # Ensure Stripe key is set from settings
    stripe.api_key = settings.STRIPE_SECRET_KEY
    
    try:
        data = request.data
        payment_intent_id = data.get('payment_intent_id')
        delivery_address = data.get('delivery_address', '')
        special_instructions = data.get('special_instructions', '')
        items = data.get('items', [])
        
        if not payment_intent_id:
            return Response({'error': 'Payment intent ID required'}, status=400)
        
        # Verify payment with Stripe
        try:
            intent = stripe.PaymentIntent.retrieve(
                payment_intent_id,
                api_key=stripe.api_key  # Explicitly pass the API key
            )
            if intent.status != 'succeeded':
                return Response({'error': 'Payment not completed'}, status=400)
        except stripe.error.StripeError as e:
            return Response({'error': 'Invalid payment'}, status=400)
        
        # Get user
        current_user = request.user
        if not current_user.is_authenticated:
            # Try to get user from session
            session_key = request.headers.get('X-Session-Key')
            if session_key:
                try:
                    from django.contrib.sessions.models import Session
                    session = Session.objects.get(session_key=session_key)
                    session_data = session.get_decoded()
                    user_id = session_data.get('_auth_user_id')
                    if user_id:
                        current_user = User.objects.get(id=user_id)
                except:
                    pass
        
        if not current_user or current_user.is_anonymous:
            return Response({'error': 'User authentication required'}, status=401)
        
        # Get or create customer
        customer, created = Customer.objects.get_or_create(
            user=current_user,
            defaults={'phone': '', 'address': delivery_address}
        )
        
        # Calculate total amount
        total_amount = intent.amount / 100  # Convert from cents
        
        # Create order
        order = Order.objects.create(
            customer=customer,
            total_amount=total_amount,
            delivery_address=delivery_address,
            special_instructions=special_instructions,
            status='confirmed',  # Payment confirmed
            payment_status='paid'
        )
        
        # Create order items
        for item_data in items:
            try:
                dish = Dish.objects.get(id=item_data['dish_id'])
                OrderItem.objects.create(
                    order=order,
                    dish=dish,
                    quantity=item_data['quantity'],
                    price=dish.price,
                    special_instructions=item_data.get('special_instructions', '')
                )
            except Dish.DoesNotExist:
                continue
        
        return Response({
            'success': True,
            'order_id': order.id,
            'message': 'Order created successfully'
        }, status=201)
        
    except Exception as e:
        print(f"❌ Error confirming payment: {e}")
        return Response({'error': str(e)}, status=400)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def get_stripe_config(request):
    """Get Stripe publishable key for frontend"""
    try:
        publishable_key = settings.STRIPE_PUBLISHABLE_KEY
        if not publishable_key:
            return Response({'error': 'Stripe not configured'}, status=500)
        
        print(f"✅ Returning Stripe key: {publishable_key[:20]}...")
        return Response({
            'publishable_key': publishable_key,
            'success': True
        })
    except Exception as e:
        print(f"❌ Error getting Stripe config: {e}")
        return Response({'error': str(e)}, status=500)
