from urllib import request

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import *

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        if User.objects.filter(username=self.request.data['username']).exists() or User.objects.filter(email=self.request.data['email']).exists():
            return Response({"detail": "User with email and/or username already exists."}, status=status.HTTP_409_CONFLICT)

        return super().create(request, *args, **kwargs)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class UserProfileDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'username'

class MyProfileDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        queryset = User.objects.get(pk=self.request.user.id)
        serializer_class = UserProfileSerializer
        return Response(serializer_class(queryset).data, status=status.HTTP_200_OK)

class UserProfileUpdateView(generics.UpdateAPIView):
    serializer_class = UserUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    model = User

    def update(self, request, *args, **kwargs):
        if "id" in request.data or "password" in request.data:
            return Response(
                {"detail": "Fields ID and PASSWORD not allowed in request."},
                status=status.HTTP_400_BAD_REQUEST
            )

        instance = self.request.user
        serializer = self.serializer_class(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserPasswordUpdateView(generics.UpdateAPIView):
    serializer_class = PasswordUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    model = User

    def update(self, request, *args, **kwargs):
        instance = self.request.user
        serializer = self.serializer_class(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        if serializer.is_valid():
            if current_password and not instance.check_password(current_password):
                return Response(
                    {"detail": "Current password does not match."},
                    status=status.HTTP_403_FORBIDDEN
                )

            instance.set_password(new_password)

            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FollowToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, username):
        target_user = get_object_or_404(User, username=username)
        if target_user == request.user:
            return Response(
                {"Error": "You cannot follow yourself."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if request.user.following.filter(id=target_user.id).exists():
            request.user.following.remove(target_user)
            return Response({"Success": f"Unfollowed @{target_user.username}."}, status=status.HTTP_200_OK)
        else:
            request.user.following.add(target_user)
            return Response({"Success": f"Followed @{target_user.username}."}, status=status.HTTP_200_OK)

class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_update(self, serializer):
        if self.get_object().author != self.request.user:
            self.permission_denied(self.request, message="You are not authorized to edit this post.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            self.permission_denied(self.request, message="You are not authorized to delete this post.")
        instance.delete()

class LikeToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        if post.likes.filter(id=request.user.id).exists():
            post.likes.remove(request.user)
            return Response({"detail": "Unliked post."}, status=status.HTTP_200_OK)
        else:
            post.likes.add(request.user)
            return Response({"detail": "Liked post."}, status=status.HTTP_200_OK)


class RepostToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        if post.reposts.filter(id=request.user.id).exists():
            post.reposts.remove(request.user)
            return Response({"detail": "Removed repost."}, status=status.HTTP_200_OK)
        else:
            post.reposts.add(request.user)
            return Response({"detail": "Reposted successfully."}, status=status.HTTP_200_OK)