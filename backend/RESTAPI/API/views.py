from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import *

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        if 'username' not in request.data or 'email' not in request.data or 'password' not in request.data:
            return Response(status=status.HTTP_400_BAD_REQUEST)
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

class UserProfileDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'username'

class MyProfileDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        queryset = User.objects.get(pk=self.request.user.id)
        serializer_class = UserProfileSerializer
        response_data = {
            'id': self.request.user.id,
            **serializer_class(queryset).data
        }
        return Response(response_data, status=status.HTTP_200_OK)

    serializer_class = UserUpdateSerializer
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

class MyProfileDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer
    queryset = User.objects.all()

    def get_object(self, *args, **kwargs):
        user_to_delete = self.request.user
        if not user_to_delete.is_authenticated:
            return Response({'error': 'User is not authenticated'}, status=401)

        return user_to_delete

    def perfrom_destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()


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

class PostCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer= PostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=self.request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PostDeleteView(generics.DestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            self.permission_denied(self.request, message="You are not authorized to delete this post.")
        instance.delete()

class PostDetailView(generics.RetrieveAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class CommentCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer= CommentSerializer(data=request.data)
        if serializer.is_valid():
            post_id = request.data.get('post_id')
            post_instance = get_object_or_404(Post, pk=post_id)
            serializer.save(author=self.request.user, post=post_instance)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CommentDeleteView(generics.DestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            self.permission_denied(self.request, message="You are not authorized to delete this post.")
        instance.delete()

class CommentDetailView(generics.RetrieveAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class LikeToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, pk):
        path = request.get_full_path()
        if '/posts/like/' in path:
            obj = get_object_or_404(Post, pk=pk)
        elif '/comments/like/' in path:
            obj = get_object_or_404(Comment, pk=pk)
        if obj.likes.filter(id=request.user.id).exists():
            obj.likes.remove(request.user)
            return Response({"Success": "Unliked post."}, status=status.HTTP_200_OK)
        else:
            obj.likes.add(request.user)
            return Response({"Success": "Liked post."}, status=status.HTTP_200_OK)


class RepostToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        if post.reposts.filter(id=request.user.id).exists():
            post.reposts.remove(request.user)
            return Response({"Success": "Removed repost."}, status=status.HTTP_200_OK)
        else:
            post.reposts.add(request.user)
            return Response({"Success": "Reposted successfully."}, status=status.HTTP_200_OK)

class UserPostListView(generics.ListAPIView):
    serializer_class = PostSerializer
    pagination_class = PageNumberPagination
    page_size = 10
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self, *args, **kwargs):
        url_name = self.request.resolver_match.url_name
        if url_name == 'user-post-list':
            username = self.kwargs.get('username')
        elif url_name == 'my-post-list':
            username = self.request.user.username
        if not username:
            raise serializers.ValidationError({'error': 'Username is required.'})

        user = get_object_or_404(User, username=username)
        posts = Post.objects.filter(author=user).order_by('-created_at')
        return posts

class FeedPostListView(generics.ListAPIView):
    serializer_class = PostSerializer
    pagination_class = PageNumberPagination
    page_size = 10
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self, *args, **kwargs):
        me = self.request.user
        following_users = me.following.all()
        posts = Post.objects.filter(author__in=following_users).order_by('-created_at')
        return posts