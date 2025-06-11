from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Dish, Customer, Order, OrderItem, DishRating, Restaurant, AdminProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class AdminProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = AdminProfile
        fields = ['id', 'user', 'admin_email', 'is_super_admin', 'created_at']

class CategorySerializer(serializers.ModelSerializer):
    dishes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'image', 'is_active', 'created_at', 'dishes_count']
    
    def get_dishes_count(self, obj):
        return obj.dish_set.count()

class DishSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    average_rating = serializers.ReadOnlyField()
    
    class Meta:
        model = Dish
        fields = [
            'id', 'name', 'description', 'price', 'category', 'category_id',
            'image', 'is_available', 'preparation_time', 'ingredients',
            'calories', 'is_spicy', 'is_vegetarian', 'average_rating',
            'created_at', 'updated_at'
        ]

class CustomerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    total_orders = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = ['id', 'user', 'phone', 'address', 'date_of_birth', 'created_at', 'total_orders', 'total_spent']
    
    def get_total_orders(self, obj):
        return Order.objects.filter(customer=obj).count()
    
    def get_total_spent(self, obj):
        orders = Order.objects.filter(customer=obj, payment_status='paid')
        return sum(order.total_amount for order in orders)

class OrderItemSerializer(serializers.ModelSerializer):
    dish = DishSerializer(read_only=True)
    dish_id = serializers.IntegerField(write_only=True)
    total_price = serializers.ReadOnlyField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'dish', 'dish_id', 'quantity', 'price', 'special_instructions', 'total_price']

class OrderSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    items = OrderItemSerializer(source='orderitem_set', many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'order_date', 'status', 'payment_status',
            'total_amount', 'delivery_address', 'special_instructions',
            'estimated_delivery_time', 'actual_delivery_time', 'items'
        ]

class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    
    class Meta:
        model = Order
        fields = [
            'delivery_address', 'special_instructions', 'items'
        ]
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        
        total_amount = 0
        for item_data in items_data:
            dish = Dish.objects.get(id=item_data['dish_id'])
            item_data['price'] = dish.price
            order_item = OrderItem.objects.create(order=order, **item_data)
            total_amount += order_item.total_price
        
        order.total_amount = total_amount
        order.save()
        return order

class DishRatingSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    dish = DishSerializer(read_only=True)
    dish_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = DishRating
        fields = ['id', 'dish', 'dish_id', 'customer', 'rating', 'comment', 'created_at']

class RestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = [
            'id', 'name', 'address', 'phone', 'email',
            'opening_time', 'closing_time', 'is_active',
            'description', 'logo'
        ] 