from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

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
    # 🌟 Public & Customer API
    path('api/', include(router.urls)),
    path('api/restaurant-info/', views.restaurant_info, name='restaurant-info'),
    path('api/menu-overview/', views.menu_overview, name='menu-overview'),
    path('api/register/', views.register_user, name='register'),
    path('api/profile/', views.user_profile, name='profile'),
    
    # 🛡️ Admin API
    path('api/admin/', include(admin_router.urls)),
    path('api/admin/dashboard/', views.admin_dashboard_stats, name='admin-dashboard'),
    path('api/admin/login/', views.admin_login, name='admin-login'),
    
    # 🔐 Authentication
    path('api-auth/', include('rest_framework.urls')),
    path('api/check-user-type/', views.check_user_type, name='check-user-type'),
] 