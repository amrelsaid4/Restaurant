from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import Category, Dish, Customer, Order, OrderItem, DishRating, Restaurant, AdminProfile
from .serializers import (
    CategorySerializer, DishSerializer, CustomerSerializer,
    OrderSerializer, OrderCreateSerializer, DishRatingSerializer,
    RestaurantSerializer, UserSerializer
)

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
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if hasattr(self.request.user, 'customer'):
            return Order.objects.filter(customer=self.request.user.customer)
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
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update order status"""
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
    """Get current user profile"""
    try:
        customer = request.user.customer
        serializer = CustomerSerializer(customer)
        return Response(serializer.data)
    except Customer.DoesNotExist:
        # Create customer if it doesn't exist
        customer = Customer.objects.create(
            user=request.user,
            phone='',
            address=''
        )
        serializer = CustomerSerializer(customer)
        return Response(serializer.data)

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

@api_view(['POST'])
@permission_classes([AllowAny])
def customer_login(request):
    """Login function for regular customers, allows login with username or email."""
    from django.contrib.auth import authenticate, login

    print("Request data received:", request.data) # DEBUGGING LINE

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
        if AdminProfile.is_admin_email(user.email):
            return Response({'error': 'Admin users should use admin login'}, status=403)
        
        login(request, user)
        return Response({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_admin': False,
                'is_customer': True
            }
        })
    else:
        return Response({'error': 'Invalid credentials'}, status=401)

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
    if not AdminProfile.is_admin_email(email):
        return Response({'error': 'Unauthorized: Not an admin email'}, status=403)
    
    # Get user by email
    try:
        user = User.objects.get(email=email)
        # --- TEMPORARY FIX: Reset password for admin user for easy testing ---
        if email == 'admin@restaurant.com':
            user.set_password('admin123')
            user.save()
        # --- END TEMPORARY FIX ---
    except User.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, status=401)
    
    # Authenticate user
    user = authenticate(request, username=user.username, password=password)
    if user:
        login(request, user)
        admin_profile = AdminProfile.objects.get(admin_email=email)
        return Response({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_admin': True,
                'is_super_admin': admin_profile.is_super_admin
            }
        })
    else:
        return Response({'error': 'Invalid credentials'}, status=401)

@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
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
    is_admin = AdminProfile.is_admin_email(user.email)
    
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

@api_view(['POST'])
@permission_classes([AllowAny])
def user_logout(request):
    """Logout function for all users"""
    from django.contrib.auth import logout
    
    logout(request)
    return Response({'message': 'Logout successful'})
