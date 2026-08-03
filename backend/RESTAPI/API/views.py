from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
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
    permission_classes = [permissions.AllowAny]
    lookup_field = 'username'

class MyProfileDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        queryset = User.objects.get(pk=self.request.user.id)
        serializer_class = UserProfileSerializer
        response_data = {
            'id': self.request.user.id,
            'email': self.request.user.email,
            **serializer_class(queryset).data,
            'is_superuser': self.request.user.is_superuser
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
            self.permission_denied(self.request, message='User is not authenticated')
        return user_to_delete

    def perfrom_destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()

class AdminUserDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer
    queryset = User.objects.all()

    def get_object(self, *args, **kwargs):
        if not self.request.user.is_superuser:
            self.permission_denied(self.request, message='You are not authorized to perform this operation')
        user_to_delete = get_object_or_404(User, username=self.kwargs.get('username'))
        if not user_to_delete:
            raise NotFound(detail='User not found', code=status.HTTP_404_NOT_FOUND)
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

        if target_user.is_private:
            follow_request = FollowRequest.objects.filter(requester=request.user, target=target_user).first()
            if follow_request:
                follow_request.delete()
                return Response({"Success": f"Cancelled follow request to @{target_user.username}."}, status=status.HTTP_200_OK)
            else:
                FollowRequest.objects.create(requester=request.user, target=target_user)
                return Response({"Success": f"Follow request sent to @{target_user.username}."}, status=status.HTTP_200_OK)
        else:
            request.user.following.add(target_user)
            return Response({"Success": f"Followed @{target_user.username}."}, status=status.HTTP_200_OK)

class ListFollowRequestView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FollowRequestSerializer
    pagination_class = PageNumberPagination
    page_size = 10

    def get_queryset(self, *args, **kwargs):
        requests = FollowRequest.objects.filter(target=self.request.user).order_by('-created_at').distinct()
        return requests

class HandleFollowRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        action = request.data.get('action')
        follow_request = get_object_or_404(FollowRequest, pk=pk, target=request.user)
        if action == "accept":
            follow_request.accept()
            return Response({"message": "Follow request accepted."}, status=status.HTTP_200_OK)
        elif action == "decline":
            follow_request.decline()
            return Response({"message": "Follow request declined."}, status=status.HTTP_200_OK)

        return Response({"error": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)

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
        if (instance.author != self.request.user) and not self.request.user.is_superuser:
            self.permission_denied(self.request, message="You are not authorized to delete this post.")
        instance.delete()

class PostDetailView(generics.RetrieveAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_object(self, *args, **kwargs):
        pk = self.kwargs.get('pk')
        post = get_object_or_404(Post, id=pk)
        is_following = self.request.user.following.filter(username=post.author.username).exists()
        if self.request.user.is_superuser or is_following or self.request.user.username == post.author.username:
            return post
        else:
            return self.permission_denied(self.request, message="You are not authorized to view this post.")


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
        if (instance.author != self.request.user) and not self.request.user.is_superuser:
            self.permission_denied(self.request, message="You are not authorized to delete this post.")
        instance.delete()

class CommentDetailView(generics.RetrieveAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_object(self, *args, **kwargs):
        pk = self.kwargs.get('pk')
        comment = get_object_or_404(Comment, id=pk)
        is_following = self.request.user.following.filter(username=comment.author.username).exists()
        if self.request.user.is_superuser or is_following or self.request.user.username == comment.author.username:
            return comment
        else:
            return self.permission_denied(self.request, message="You are not authorized to view this comment.")

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
        if post.author == request.user:
            return Response({"Error": "You cannot repost your own post."}, status=status.HTTP_400_BAD_REQUEST)
            
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
        is_following = self.request.user.following.filter(username=user.username).exists()
        if self.request.user.is_superuser or is_following or self.request.user.username == user.username:
            posts = Post.objects.filter(Q(author=user) | Q(reposts=user)).order_by('-created_at').distinct()
        else:
            return self.permission_denied(self.request, message="You are not authorized to view this user's posts.")
        return posts

class FeedPostListView(generics.ListAPIView):
    serializer_class = PostSerializer
    pagination_class = PageNumberPagination
    page_size = 10
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self, *args, **kwargs):
        me = self.request.user
        if not me.is_authenticated or me.following_count == 0:
            posts = Post.objects.filter(Q(author__is_private=False)).order_by('-created_at').distinct()
        else:
            following_users = me.following.all()
            posts = Post.objects.filter(Q(author__in=following_users) | Q(reposts__in=following_users)).order_by('-created_at').distinct()
        return posts

class PostCommentsView(generics.ListAPIView):
    serializer_class = CommentSerializer
    pagination_class = PageNumberPagination
    page_size = 10
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self, *args, **kwargs):
        post_id = self.kwargs['pk']
        post = get_object_or_404(Post, pk=post_id)
        is_following = self.request.user.following.filter(username=post.author.username).exists()
        if self.request.user.is_superuser or is_following or self.request.user.username == post.author.username:
            comments = Comment.objects.filter(post=post).filter(Q(author__is_private=False) | Q(author=self.request.user) | Q(author__followers=self.request.user)).distinct().order_by('-created_at')
        else:
            return self.permission_denied(self.request, message="You are not authorized to view this user's posts.")
        return comments

class PostSearchView(generics.ListAPIView):
    serializer_class = PostSerializer
    pagination_class = PageNumberPagination
    page_size = 5
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self, *args, **kwargs):
        search = self.kwargs['search']
        if not self.request.user.is_authenticated:
            posts = Post.objects.filter(content__icontains=search).filter(Q(author__is_private=False)).order_by('-created_at')
        else:
            posts = Post.objects.filter(content__icontains=search).filter(Q(author__is_private=False) | Q(author=self.request.user) | Q(author__followers=self.request.user)).distinct().order_by('-created_at')
        return posts

class UserSearchView(generics.ListAPIView):
    serializer_class = UserProfileSerializer
    pagination_class = PageNumberPagination
    page_size = 5
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self, *args, **kwargs):
        search = self.kwargs['search']
        users = User.objects.filter(Q(username__icontains=search) | Q(name__icontains=search)).distinct().order_by('-created_at')
        return users

class CreateReportView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ReportSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=self.request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ReportListView(generics.RetrieveAPIView):
    serializer_class = ReportSerializer
    pagination_class = PageNumberPagination
    page_size = 5
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self, *args, **kwargs):
        pk = self.kwargs['pk']
        reports = Report.objects.filter(id=pk).order_by('-created_at')
        return reports

class FeedReportListView(generics.ListAPIView):
    serializer_class = ReportSerializer
    pagination_class = PageNumberPagination
    page_size = 10
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self, *args, **kwargs):
        report_status = self.kwargs.get('filter')

        if not self.request.user.is_superuser:
            self.permission_denied(self.request, message='You are not authorized to perform this operation.')
        if report_status == 'closed':
            reports = Report.objects.filter(is_closed=True).order_by('-created_at')
        elif report_status == 'open':
            reports = Report.objects.filter(is_closed=False).order_by('-created_at')
        elif report_status == 'null':
            open_reports = Report.objects.filter(is_closed=False)
            serialized_data = self.get_serializer(open_reports, many=True).data
            null_ids = [item['id'] for item in serialized_data if item['obj_instance'] is None]
            if null_ids:
                Report.objects.filter(id__in=null_ids).update(is_closed=True)
            return Report.objects.filter(id__in=null_ids).order_by('-created_at')
        else:
            reports = Report.objects.all().order_by('-created_at')
        return reports

class ReportToggleStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, pk):
        report = get_object_or_404(Report, pk=pk)
        if not self.request.user.is_superuser:
            return Response({"Error": "You are not authorized to perform this operation."}, status=status.HTTP_403_FORBIDDEN)

        if not report.is_closed:
            report.is_closed = True
            report.save()
            return Response({"Success": "Closed report."}, status=status.HTTP_200_OK)
        else:
            report.is_closed = False
            report.save()
            return Response({"Success": "Opened report."}, status=status.HTTP_200_OK)