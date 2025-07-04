from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import login, authenticate
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
import logging
import time
from .models import Category, Dish, Customer, Order, OrderItem, DishRating, Restaurant, AdminProfile
from .serializers import (
    CategorySerializer, DishSerializer, CustomerSerializer,
    OrderSerializer, OrderCreateSerializer, DishRatingSerializer,
    RestaurantSerializer, UserSerializer
)

# Configure logging
logger = logging.getLogger(__name__)

# Initialize Stripe from settings
try:
    stripe.api_key = settings.STRIPE_SECRET_KEY
    logger.info("Stripe initialized successfully")
except Exception as e:
    logger.error(f"Error setting Stripe key: {e}")
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
                        logger.info(f"Found user via session: {current_user.username}")
                except Exception as e:
                    logger.warning(f"Session authentication failed: {e}")
                    return Order.objects.none()
        
        # If still no user, return empty
        if not current_user or current_user.is_anonymous:
            logger.warning("No authenticated user found for orders")
            return Order.objects.none()
            
        # Get customer and their orders
        try:
            customer = current_user.customer
            orders = Order.objects.filter(customer=customer).order_by('-order_date')
            logger.info(f"Found {orders.count()} orders for user {current_user.username}")
            return orders
        except Customer.DoesNotExist:
            logger.warning(f"No customer found for user {current_user.username}")
            # Try to create customer profile if missing
            try:
                Customer.objects.create(
                    user=current_user,
                    phone='',
                    address=''
                )
                logger.info(f"Created customer profile for user {current_user.username}")
                # Return orders after creating customer
                return Order.objects.filter(customer__user=current_user).order_by('-order_date')
            except Exception as e:
                logger.error(f"Failed to create customer for user {current_user.username}: {e}")
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
def customer_login(request):
    """Customer login endpoint"""
    logger = logging.getLogger(__name__)
    
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        identity = data.get('identity')
        password = data.get('password')
        
        if not identity or not password:
            return JsonResponse({'error': 'Identity and password are required'}, status=400)
        
        # Try to find user by username or email
        user = None
        if '@' in identity:
            try:
                user = User.objects.get(email=identity)
            except User.DoesNotExist:
                pass
        else:
            try:
                user = User.objects.get(username=identity)
            except User.DoesNotExist:
                pass
        
        if not user:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
        
        # Check password
        if not user.check_password(password):
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
        
        # Check if user is a customer (not admin)
        if user.is_staff or user.is_superuser:
            return JsonResponse({'error': 'Admin users should use admin login'}, status=403)
        
        # Log the user in
        login(request, user)
        
        # Create session
        request.session.save()
        session_key = request.session.session_key
        
        response_data = {
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_admin': user.is_staff or user.is_superuser,
                'is_customer': not (user.is_staff or user.is_superuser)
            },
            'session_key': session_key
        }
        
        return JsonResponse(response_data)
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return JsonResponse({'error': 'Login failed'}, status=500)

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
        response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        
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
                except Exception as e:
                    logger.warning(f"Session user error: {e}")
        
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
        logger.error(f"Error in submit_rating_simple: {e}")
        return Response({'error': str(e)}, status=400)

@csrf_exempt
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def add_rating(request):
    """Simple rating add function without any middleware issues"""
    try:
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
            except Exception as e:
                logger.warning(f"Error finding user: {e}")
        
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
        
        return Response({
            'success': True,
            'rating_id': rating.id,
            'message': 'Rating submitted successfully'
        }, status=201)
        
    except Exception as e:
        logger.error(f"Error in add_rating: {e}")
        return Response({'error': str(e)}, status=400)

@csrf_exempt
@api_view(['PUT'])
@permission_classes([AllowAny])
def update_rating(request, rating_id):
    """Update existing rating"""
    try:
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
            except Exception as e:
                logger.warning(f"Error finding user: {e}")
        
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
            
            return Response({
                'success': True,
                'rating_id': rating.id,
                'message': 'Rating updated successfully'
            }, status=200)
            
        except DishRating.DoesNotExist:
            return Response({'error': 'Rating not found or not owned by user'}, status=404)
        
    except Exception as e:
        logger.error(f"Error in update_rating: {e}")
        return Response({'error': str(e)}, status=400)

# ========================================
# 💳 STRIPE PAYMENT VIEWS
# ========================================

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def create_checkout_session(request):
    """Create Stripe Checkout Session for complete payment flow"""
    # Force CSRF exemption
    setattr(request, '_dont_enforce_csrf_checks', True)
    
    try:
        logger.info(f"Checkout session request received from user: {request.user}")
        logger.info(f"Request headers: {dict(request.headers)}")
        
        data = request.data
        items = data.get('items', [])
        delivery_address = data.get('delivery_address', '')
        special_instructions = data.get('special_instructions', '')
        
        logger.info(f"Checkout data: items={len(items)}, address={delivery_address}")
        
        if not items:
            return Response({'error': 'No items provided'}, status=400)
        
        # Get authenticated user
        current_user = request.user
        logger.info(f"Initial user: {current_user}, authenticated: {current_user.is_authenticated}")
        
        # If user is not authenticated, try session-based authentication
        if not current_user.is_authenticated:
            session_key = request.headers.get('X-Session-Key')
            logger.info(f"Checking session key: {session_key}")
            if session_key:
                try:
                    from django.contrib.sessions.models import Session
                    session = Session.objects.get(session_key=session_key)
                    session_data = session.get_decoded()
                    user_id = session_data.get('_auth_user_id')
                    if user_id:
                        current_user = User.objects.get(id=user_id)
                        logger.info(f"Found user via session: {current_user}")
                except Exception as e:
                    logger.warning(f"Session user error: {e}")
        
        # If still no authenticated user, check cookies
        if not current_user or current_user.is_anonymous:
            sessionid = request.COOKIES.get('sessionid')
            logger.info(f"Checking sessionid cookie: {sessionid}")
            if sessionid:
                try:
                    from django.contrib.sessions.models import Session
                    session = Session.objects.get(session_key=sessionid)
                    session_data = session.get_decoded()
                    user_id = session_data.get('_auth_user_id')
                    if user_id:
                        current_user = User.objects.get(id=user_id)
                        logger.info(f"Found user via sessionid cookie: {current_user}")
                except Exception as e:
                    logger.warning(f"Sessionid cookie error: {e}")
        
        # Create guest user if no authentication found
        if not current_user or current_user.is_anonymous:
            logger.warning("No authenticated user found, creating guest user")
            timestamp = int(time.time())
            guest_email = f"guest_{timestamp}@restaurant.com"
            guest_user, created = User.objects.get_or_create(
                username=f'guest_{timestamp}',
                defaults={
                    'email': guest_email,
                    'first_name': 'Guest',
                    'last_name': 'User'
                }
            )
            current_user = guest_user
            logger.info(f"Created guest user: {current_user} (created: {created})")
        else:
            logger.info(f"Using authenticated user: {current_user} (ID: {current_user.id})")
        
        # Get or create customer for authenticated user
        customer, created = Customer.objects.get_or_create(
            user=current_user,
            defaults={'phone': '', 'address': delivery_address}
        )
        logger.info(f"Customer: {customer} (ID: {customer.id}, created: {created})")
        
        # Build line items for Stripe
        line_items = []
        total_amount = 0
        
        for item_data in items:
            try:
                dish = Dish.objects.get(id=item_data['dish_id'])
                quantity = int(item_data['quantity'])
                price_cents = int(dish.price * 100)  # Convert to cents
                
                line_items.append({
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': dish.name,
                            'description': dish.description[:100] if dish.description else 'Delicious dish from our restaurant',
                        },
                        'unit_amount': price_cents,
                    },
                    'quantity': quantity,
                })
                total_amount += float(dish.price) * quantity
                
            except Dish.DoesNotExist:
                logger.warning(f"Dish not found: {item_data.get('dish_id')}")
                continue
        
        if not line_items:
            return Response({'error': 'No valid items found'}, status=400)
        
        # Add delivery fee
        delivery_fee_cents = 399  # $3.99
        line_items.append({
            'price_data': {
                'currency': 'usd',
                'product_data': {
                    'name': 'Delivery Fee',
                    'description': 'Home delivery service',
                },
                'unit_amount': delivery_fee_cents,
            },
            'quantity': 1,
        })
        total_amount += 3.99
        
        # Create Stripe Checkout Session
        try:
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=line_items,
                mode='payment',
                success_url='http://localhost:5173/order-success?session_id={CHECKOUT_SESSION_ID}',
                cancel_url='http://localhost:5173/order-cancelled',
                metadata={
                    'customer_id': str(customer.id),
                    'user_id': str(current_user.id),
                    'user_email': str(current_user.email),
                    'delivery_address': delivery_address,
                    'special_instructions': special_instructions,
                    'items': json.dumps(items),
                    'total_amount': str(total_amount)
                },
                customer_email=current_user.email if current_user.email else None,
                billing_address_collection='required',
            )
            
            logger.info(f"Created Stripe session for customer {customer.id} (user: {current_user.username})")
            
            return Response({
                'checkout_url': checkout_session.url,
                'session_id': checkout_session.id,
                'total_amount': total_amount
            })
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {e}")
            return Response({'error': f'Checkout error: {str(e)}'}, status=400)
        
    except Exception as e:
        logger.error(f"Error creating checkout session: {e}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=400)

@api_view(['GET'])
@permission_classes([AllowAny])
def stripe_success(request):
    """Handle successful payment redirect from Stripe"""
    session_id = request.GET.get('session_id')
    
    if not session_id:
        return Response({'error': 'No session ID provided'}, status=400)
    
    try:
        # Retrieve the checkout session
        session = stripe.checkout.Session.retrieve(session_id)
        
        if session.payment_status == 'paid':
            
            
            # Get metadata
            metadata = session.metadata
            customer_id = metadata.get('customer_id')
            delivery_address = metadata.get('delivery_address', '')
            special_instructions = metadata.get('special_instructions', '')
            items_json = metadata.get('items', '[]')
            total_amount = float(metadata.get('total_amount', 0))
            
            try:
                items = json.loads(items_json)
            except:
                items = []
            
            # Get customer
            if customer_id:
                try:
                    customer = Customer.objects.get(id=customer_id)
                    
                    # Check if order already exists
                    existing_order = Order.objects.filter(
                        customer=customer,
                        total_amount=total_amount,
                        payment_status='paid'
                    ).order_by('-order_date').first()
                    
                    if not existing_order:
                        # Create order
                        order = Order.objects.create(
                            customer=customer,
                            total_amount=total_amount,
                            delivery_address=delivery_address,
                            special_instructions=special_instructions,
                            status='confirmed',
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
                            'message': 'Payment successful! Your order has been confirmed.',
                            'total_amount': total_amount
                        })
                    else:
                        return Response({
                            'success': True,
                            'order_id': existing_order.id,
                            'message': 'Order already exists for this payment.',
                            'total_amount': total_amount
                        })
                        
                except Customer.DoesNotExist:
                    return Response({'error': 'Customer not found'}, status=404)
            else:
                return Response({'error': 'Customer information missing'}, status=400)
        else:
            return Response({'error': 'Payment not completed'}, status=400)
            
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}")
        return Response({'error': 'Payment verification failed'}, status=400)
    except Exception as e:
        logger.error(f"Error processing success: {e}")
        return Response({'error': str(e)}, status=400)

@api_view(['GET'])
@permission_classes([AllowAny])
def stripe_cancel(request):
    """Handle cancelled payment redirect from Stripe"""
    logger.info("Payment cancelled by user")
    return Response({
        'cancelled': True,
        'message': 'Payment was cancelled. You can try again when ready.'
    })

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def get_stripe_config(request):
    """Get Stripe publishable key for frontend"""
    try:
        publishable_key = settings.STRIPE_PUBLISHABLE_KEY
        if not publishable_key:
            return Response({'error': 'Stripe not configured'}, status=500)
        
        return Response({
            'publishable_key': publishable_key,
            'success': True
        })
    except Exception as e:
        logger.error(f"Error getting Stripe config: {e}")
        return Response({'error': str(e)}, status=500)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def stripe_webhook(request):
    """Handle Stripe webhook events"""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = settings.STRIPE_ENDPOINT_SECRET
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
        logger.info(f"Stripe webhook event received: {event['type']}")
    except ValueError as e:
        logger.error(f"Invalid payload: {e}")
        return Response({'error': 'Invalid payload'}, status=400)
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid signature: {e}")
        return Response({'error': 'Invalid signature'}, status=400)
    
    # Handle the event
    try:
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            logger.info(f"Checkout completed: {session['id']}")
            
            # Get metadata
            metadata = session.get('metadata', {})
            customer_id = metadata.get('customer_id')
            delivery_address = metadata.get('delivery_address', '')
            special_instructions = metadata.get('special_instructions', '')
            items_json = metadata.get('items', '[]')
            total_amount = float(metadata.get('total_amount', 0))
            
            try:
                items = json.loads(items_json)
            except:
                items = []
            
            if customer_id:
                try:
                    customer = Customer.objects.get(id=customer_id)
                    
                    # Check if order already exists
                    existing_order = Order.objects.filter(
                        customer=customer,
                        total_amount=total_amount,
                        payment_status='paid'
                    ).order_by('-order_date').first()
                    
                    if not existing_order:
                        # Create order
                        order = Order.objects.create(
                            customer=customer,
                            total_amount=total_amount,
                            delivery_address=delivery_address,
                            special_instructions=special_instructions,
                            status='confirmed',
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
                        
                        logger.info(f"Order created via webhook: #{order.id}")
                    else:
                        logger.info("Order already exists for this payment")
                        
                except Customer.DoesNotExist:
                    logger.error(f"Customer not found: {customer_id}")
                    
        elif event['type'] == 'checkout.session.expired':
            session = event['data']['object']
            logger.info(f"Checkout session expired: {session['id']}")
            
        else:
            logger.info(f"Unhandled event type: {event['type']}")
            
    except Exception as e:
        logger.error(f"Error handling webhook: {e}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=400)
    
    return Response({'status': 'success'})
