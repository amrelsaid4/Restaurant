from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

# Admin Profile for managing admin users
class AdminProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name="User")
    is_super_admin = models.BooleanField(default=False, verbose_name="Super Admin")
    admin_email = models.EmailField(unique=True, verbose_name="Admin Email")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Admin Profile"
        verbose_name_plural = "Admin Profiles"
    
    def __str__(self):
        return f"Admin: {self.user.username} ({self.admin_email})"
    
    @classmethod
    def is_admin_email(cls, email):
        """Check if email belongs to an admin"""
        return cls.objects.filter(admin_email=email).exists()

class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name="Category Name")
    description = models.TextField(blank=True, verbose_name="Description")
    image = models.ImageField(upload_to='categories/', blank=True, null=True, verbose_name="Category Image")
    is_active = models.BooleanField(default=True, verbose_name="Active")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ['name']

    def __str__(self):
        return self.name

class Dish(models.Model):
    name = models.CharField(max_length=100, verbose_name="Dish Name")
    description = models.TextField(verbose_name="Description")
    price = models.DecimalField(max_digits=8, decimal_places=2, verbose_name="Price")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, verbose_name="Category")
    image = models.ImageField(upload_to='dishes/', blank=True, null=True, verbose_name="Dish Image")
    is_available = models.BooleanField(default=True, verbose_name="Available")
    preparation_time = models.PositiveIntegerField(default=15, verbose_name="Preparation Time (minutes)")
    ingredients = models.TextField(blank=True, verbose_name="Ingredients")
    calories = models.PositiveIntegerField(blank=True, null=True, verbose_name="Calories")
    is_spicy = models.BooleanField(default=False, verbose_name="Spicy")
    is_vegetarian = models.BooleanField(default=False, verbose_name="Vegetarian")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Dish"
        verbose_name_plural = "Dishes"
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.name} - ${self.price}"

    @property
    def average_rating(self):
        ratings = self.dishrating_set.all()
        if ratings:
            return sum([r.rating for r in ratings]) / len(ratings)
        return 0

class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name="User")
    phone = models.CharField(max_length=15, verbose_name="Phone Number")
    address = models.TextField(verbose_name="Address")
    date_of_birth = models.DateField(blank=True, null=True, verbose_name="Date of Birth")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Customer"
        verbose_name_plural = "Customers"

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"

class Order(models.Model):
    ORDER_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, verbose_name="Customer")
    order_date = models.DateTimeField(auto_now_add=True, verbose_name="Order Date")
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='pending', verbose_name="Order Status")
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending', verbose_name="Payment Status")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Total Amount")
    delivery_address = models.TextField(verbose_name="Delivery Address")
    special_instructions = models.TextField(blank=True, verbose_name="Special Instructions")
    estimated_delivery_time = models.DateTimeField(blank=True, null=True, verbose_name="Estimated Delivery Time")
    actual_delivery_time = models.DateTimeField(blank=True, null=True, verbose_name="Actual Delivery Time")

    class Meta:
        verbose_name = "Order"
        verbose_name_plural = "Orders"
        ordering = ['-order_date']

    def __str__(self):
        return f"Order #{self.id} - {self.customer} - ${self.total_amount}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, verbose_name="Order")
    dish = models.ForeignKey(Dish, on_delete=models.CASCADE, verbose_name="Dish")
    quantity = models.PositiveIntegerField(default=1, verbose_name="Quantity")
    price = models.DecimalField(max_digits=8, decimal_places=2, verbose_name="Price")
    special_instructions = models.TextField(blank=True, verbose_name="Special Instructions")

    class Meta:
        verbose_name = "Order Item"
        verbose_name_plural = "Order Items"

    def __str__(self):
        return f"{self.dish.name} x {self.quantity}"

    @property
    def total_price(self):
        return self.price * self.quantity

class DishRating(models.Model):
    dish = models.ForeignKey(Dish, on_delete=models.CASCADE, verbose_name="Dish")
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, verbose_name="Customer")
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Rating"
    )
    comment = models.TextField(blank=True, verbose_name="Comment")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Dish Rating"
        verbose_name_plural = "Dish Ratings"
        # Removed unique_together to allow multiple ratings from same customer

    def __str__(self):
        return f"{self.dish.name} - {self.rating} stars"

class Restaurant(models.Model):
    name = models.CharField(max_length=100, verbose_name="Restaurant Name")
    address = models.TextField(verbose_name="Address")
    phone = models.CharField(max_length=15, verbose_name="Phone Number")
    email = models.EmailField(verbose_name="Email")
    opening_time = models.TimeField(verbose_name="Opening Time")
    closing_time = models.TimeField(verbose_name="Closing Time")
    is_active = models.BooleanField(default=True, verbose_name="Active")
    description = models.TextField(blank=True, verbose_name="Description")
    logo = models.ImageField(upload_to='restaurant/', blank=True, null=True, verbose_name="Logo")

    class Meta:
        verbose_name = "Restaurant"
        verbose_name_plural = "Restaurants"

    def __str__(self):
        return self.name

# MenuItem - keeping for backward compatibility, now points to Dish
MenuItem = Dish
