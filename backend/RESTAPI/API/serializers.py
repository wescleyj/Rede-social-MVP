from rest_framework import serializers
from .models import *

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'name', 'email', 'bio', 'created_at', 'avatar_url', 'banner_url', 'is_superuser']

    def create(self, validated_data):
        request = self.context.get('request')
        if request.user.is_authenticated and request.user.is_superuser:
            user = User.objects.create_superuser(**validated_data)
        else:
            user = User.objects.create_user(**validated_data)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    followers_count = serializers.IntegerField(read_only=True)
    following_count = serializers.IntegerField(read_only=True)
    posts_count = serializers.IntegerField(read_only=True)
    is_following = serializers.SerializerMethodField(read_only=True)
    is_pending = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ['username', 'name', 'bio', 'created_at', 'following_count', 'followers_count', 'posts_count', 'avatar_url', 'banner_url', 'is_following', 'is_private', 'is_pending']

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user.following.filter(id=obj.id).exists()
        return False

    def get_is_pending(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and obj.is_private:
            return FollowRequest.objects.filter(requester=request.user, target=obj).exists()
        return False

class UserUpdateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=True)
    username = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    bio = serializers.CharField(required=True, allow_blank=True)
    avatar_url = serializers.URLField(required=True, allow_blank=True)
    banner_url = serializers.URLField(required=True, allow_blank=True)
    is_private = serializers.BooleanField(required=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'name', 'email', 'bio', 'avatar_url', 'banner_url', 'is_private']

class PasswordUpdateSerializer(serializers.ModelSerializer):
    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    username= serializers.CharField(required=False, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'current_password', 'new_password']

class AuthorSerializer(serializers.ModelSerializer):
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['name', 'username', 'avatar_url', 'is_following', 'is_private']

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user.following.filter(id=obj.id).exists()
        return False

class FollowRequestSerializer(serializers.ModelSerializer):
    requester = serializers.ReadOnlyField(source='requester.username')
    target = serializers.ReadOnlyField(source='target.username')

    class Meta:
        model = FollowRequest
        fields = ['id', 'requester', 'target', 'created_at']

class PostSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)

    likes_count = serializers.IntegerField(read_only=True)
    reposts_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)

    is_liked = serializers.SerializerMethodField()
    is_reposted = serializers.SerializerMethodField()
    repostedBy = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'author', 'content', 'media_url', 'created_at', 'likes_count', 'reposts_count', 'comments_count', 'is_liked', 'is_reposted', 'repostedBy']

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def get_is_reposted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.reposts.filter(id=request.user.id).exists()
        return False

    def get_repostedBy(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
            
        url_name = getattr(request.resolver_match, 'url_name', None)
        
        if url_name == 'user-post-list':
            username = request.resolver_match.kwargs.get('username')
            if username and obj.author.username != username and obj.reposts.filter(username=username).exists():
                user = User.objects.get(username=username)
                return {'name': user.name, 'username': user.username}
                
        elif url_name == 'my-post-list':
            if obj.author != request.user and obj.reposts.filter(id=request.user.id).exists():
                return {'name': request.user.name, 'username': request.user.username}
                
        elif url_name == 'feed-post-list':
            following_users = request.user.following.all()
            if obj.author not in following_users:
                reposter = obj.reposts.filter(id__in=following_users).first()
                if reposter:
                    return {'name': reposter.name, 'username': reposter.username}
                    
        return None

class CommentSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    post = PostSerializer(read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'content', 'media_url', 'created_at', 'likes_count', 'is_liked']

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

class ReportSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    obj_instance = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = ['id', 'author', 'reported_id', 'reported_type', 'obj_instance', 'additional_info', 'is_closed', 'created_at']

    def validate(self, attrs):
        reported_type = attrs.get('reported_type')
        reported_id = attrs.get('reported_id')
        model_mapping = {
            'user': User,
            'post': Post,
            'comment': Comment,
        }

        if reported_type not in model_mapping:
            raise serializers.ValidationError({
                'reported_type': f"Invalid type. Must be one of: {', '.join(model_mapping.keys())}"
            })
        ModelClass = model_mapping[reported_type]
        if not ModelClass.objects.filter(id=reported_id).exists():
            raise serializers.ValidationError({
                'reported_id': f"Target {reported_type} with ID '{reported_id}' does not exist."
            })
        return attrs

    def get_obj_instance(self, obj):
        mapping = {
            'user': (User, UserProfileSerializer),
            'post': (Post, PostSerializer),
            'comment': (Comment, CommentSerializer),
        }
        ModelClass, SerializerClass = mapping[obj.reported_type]
        try:
            instance = ModelClass.objects.get(id=obj.reported_id)
            return SerializerClass(instance, context=self.context).data
        except ModelClass.DoesNotExist:
            return None