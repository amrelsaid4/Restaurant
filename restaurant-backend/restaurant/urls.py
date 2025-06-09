from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'dishes', views.DishViewSet)
router.register(r'restaurants', views.RestaurantViewSet)
router.register(r'orders', views.OrderViewSet, basename='order')
router.register(r'ratings', views.DishRatingViewSet, basename='rating')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/restaurant-info/', views.restaurant_info, name='restaurant-info'),
    path('api/menu-overview/', views.menu_overview, name='menu-overview'),
    path('api/register/', views.register_user, name='register'),
    path('api/profile/', views.user_profile, name='profile'),
    path('api-auth/', include('rest_framework.urls')),
] 