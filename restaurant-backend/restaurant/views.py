from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import Category, Dish, Customer, Order, OrderItem, DishRating, Restaurant
from .serializers import (
    CategorySerializer, DishSerializer, CustomerSerializer,
    OrderSerializer, OrderCreateSerializer, DishRatingSerializer,
    RestaurantSerializer, UserSerializer
)

# Create your views here.

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
