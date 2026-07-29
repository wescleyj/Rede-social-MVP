from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email = models.EmailField(unique=True)
    username = models.CharField(unique=True, max_length=20)
    name = models.CharField(max_length=255)
    bio = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    avatar_url = models.URLField(blank=True, default="")
    banner_url = models.URLField(blank=True, default="")
    following = models.ManyToManyField('self', symmetrical=False, related_name='followers', blank=True)

    @property
    def followers_count(self):
        return self.followers.count()

    @property
    def following_count(self):
        return self.following.count()

    @property
    def posts_count(self):
        return (self.posts.count() + self.reposted_posts.count())

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'name']

class Post(models.Model):
    id = models.AutoField(primary_key=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    media_url = models.URLField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)
    reposts = models.ManyToManyField(User, related_name='reposted_posts', blank=True)

    @property
    def likes_count(self):
        return self.likes.count()

    @property
    def reposts_count(self):
        return self.reposts.count()

    @property
    def comments_count(self):
        return self.comments.count()

    class Meta:
        ordering = ['-created_at']

class Comment (models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)