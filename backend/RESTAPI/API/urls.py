from django.urls import path
from .views import (
    RegisterView,
    UserProfileDetailView,
    FollowToggleView,
    PostListCreateView,
    PostDetailView,
    LikeToggleView,
    RepostToggleView,
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('users/<str:username>/', UserProfileDetailView.as_view(), name='user-profile'),
    path('users/<str:username>/follow/', FollowToggleView.as_view(), name='follow-toggle'),
    path('posts/', PostListCreateView.as_view(), name='post-list-create'),
    path('posts/<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('posts/<int:pk>/like/', LikeToggleView.as_view(), name='post-like'),
    path('posts/<int:pk>/repost/', RepostToggleView.as_view(), name='post-repost'),
]