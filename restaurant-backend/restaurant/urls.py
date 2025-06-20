from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.http import JsonResponse
from . import views

def api_root(request):
    """API Root - Welcome message and available endpoints"""
    return JsonResponse({
        'message': 'Restaurant API Server',
        'version': '1.0',
        'endpoints': {
            'admin_panel': '/admin/',
            'api_documentation': '/api/',
            'check_user_type': '/api/check-user-type/',
            'login': '/api/login/',
            'admin_login': '/api/admin/login/',
            'register': '/api/register/',
            'dishes': '/api/dishes/',
            'categories': '/api/categories/',
            'orders': '/api/orders/',
        },
        'status': 'Server is running successfully! 🚀'
    })

# Customer/Public API Router
router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'dishes', views.DishViewSet)
router.register(r'restaurants', views.RestaurantViewSet)
router.register(r'orders', views.OrderViewSet, basename='order')
router.register(r'ratings', views.DishRatingViewSet, basename='rating')

# Admin API Router
admin_router = DefaultRouter()
admin_router.register(r'categories', views.AdminCategoryViewSet, basename='admin-category')
admin_router.register(r'dishes', views.AdminDishViewSet, basename='admin-dish')
admin_router.register(r'orders', views.AdminOrderViewSet, basename='admin-order')
admin_router.register(r'customers', views.AdminCustomerViewSet, basename='admin-customer')
admin_router.register(r'restaurants', views.AdminRestaurantViewSet, basename='admin-restaurant')

urlpatterns = [
    # 🏠 Root path
    path('', api_root, name='api-root'),
    
    # 🌟 Public & Customer API
    path('api/', include(router.urls)),
    path('api/restaurant-info/', views.restaurant_info, name='restaurant-info'),
    path('api/menu-overview/', views.menu_overview, name='menu-overview'),
    path('api/register/', views.register_user, name='register'),
    path('api/login/', views.customer_login, name='customer-login'),
    path('api/logout/', views.user_logout, name='user-logout'),
    path('api/profile/', views.user_profile, name='profile'),
    
    # 🛡️ Admin API
    path('api/admin/', include(admin_router.urls)),
    path('api/admin/dashboard/', views.admin_dashboard_stats, name='admin-dashboard'),
    path('api/admin/login/', views.admin_login, name='admin-login'),
    
    # 🔐 Authentication
    path('api-auth/', include('rest_framework.urls')),
    path('api/check-user-type/', views.check_user_type, name='check-user-type'),
    path('api/csrf-token/', views.get_csrf_token, name='csrf-token'),
    path('api/submit-rating/', views.submit_rating_simple, name='submit-rating'),
    path('api/add-rating/', views.add_rating, name='add-rating'),
    path('api/update-rating/<int:rating_id>/', views.update_rating, name='update-rating'),
    
    # 💳 Payment endpoints
    path('api/stripe/config/', views.get_stripe_config, name='stripe-config'),
    path('api/stripe/create-payment-intent/', views.create_payment_intent, name='create-payment-intent'),
    path('api/stripe/confirm-payment/', views.confirm_payment_and_create_order, name='confirm-payment'),
] 