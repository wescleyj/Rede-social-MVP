from rest_framework import serializers
from .models import User, Post

class RegisterSerializer(serializers.ModelSerializer):
    # email = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'bio', 'followers_count', 'following_count', 'created_at', 'avatar_url', 'banner_url', 'posts_count']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    # id = serializers.IntegerField(read_only=True)
    # bio = serializers.CharField(source='user.bio', read_only=True)
    # email = serializers.CharField(source='user.email', read_only=True)
    # name = serializers.CharField(source='user.username', read_only=True)
    # created_at = serializers.DateTimeField(source='date_joined', format="%Y-%m-%dT%H:%M:%SZ", read_only=True)
    followers_count = serializers.ReadOnlyField(source='user.followers_count', read_only=True)
    following_count = serializers.ReadOnlyField(source='user.following_count', read_only=True)
    # avatar_url = serializers.CharField(source='user.avatar_url', read_only=True)
    # banner_url = serializers.URLField(blank=True, default="")
    # posts_count = serializers.IntegerField(source='posts.count', read_only=True)
    #talvez esteja faltando algo

    class Meta:
        model = User
        fields = ['id', 'email', 'bio', 'followers_count', 'following_count', 'created_at', 'avatar_url', 'banner_url', 'posts_count']

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['name', 'username', 'avatar_url']

class PostSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)

    likes_count = serializers.IntegerField(read_only=True)
    reposts_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Post
        fieds = ['id', 'author', 'content', 'media_url', 'created_at', 'likes_count', 'reposts_count', 'comments_count']
