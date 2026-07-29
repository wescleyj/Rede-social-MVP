from django.urls import path
from .views import *
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('users/me/', MyProfileDetailView.as_view(), name='myinfo'),
    path('users/me/update/', UserProfileUpdateView.as_view(), name='update-profile'),
    path('users/me/update_passwd/', UserPasswordUpdateView.as_view(), name='update-password'),
    path('users/info/<str:username>/', UserProfileDetailView.as_view(), name='user-profile'),
    path('users/follow/<str:username>/', FollowToggleView.as_view(), name='follow-toggle'),
    path('posts/create/', PostCreateView.as_view(), name='post-list-create'),
    path('posts/info/<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('posts/like/<int:pk>/', LikeToggleView.as_view(), name='post-like'),
    path('posts/repost/<int:pk>/', RepostToggleView.as_view(), name='post-repost'),
    path('posts/delete/<int:pk>/', PostDeleteView.as_view(), name='post-delete'),
]