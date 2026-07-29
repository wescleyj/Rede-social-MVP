from rest_framework import serializers
from .models import *

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'name', 'email', 'bio', 'followers_count', 'following_count', 'created_at', 'avatar_url', 'banner_url', 'posts_count']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    followers_count = serializers.IntegerField(read_only=True)
    following_count = serializers.IntegerField(read_only=True)
    posts_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = ['email', 'username', 'name', 'bio', 'created_at', 'following_count', 'followers_count', 'posts_count', 'avatar_url', 'banner_url']

class UserUpdateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(read_only=True)
    username = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    bio = serializers.CharField(required=True, allow_blank=True)
    avatar_url = serializers.URLField(required=True, allow_blank=True)
    banner_url = serializers.URLField(required=True, allow_blank=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'name', 'email', 'bio', 'avatar_url', 'banner_url']

class PasswordUpdateSerializer(serializers.ModelSerializer):
    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    username= serializers.CharField(required=False, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'current_password', 'new_password']

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
        fields = ['id', 'author', 'content', 'media_url', 'created_at', 'likes_count', 'reposts_count', 'comments_count']
