from django.test import TestCase
from .serializers import RegisterSerializer, PostSerializer
from .models import User, Post, Comment
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

class SerializerTestCase(TestCase): #testa o serializer criado pra usuario
    def test_serializer_valid_data(self):
        data = {
            "username": "janedoe",
            "name": "jane doe",
            "email": "jane@example.com",
            "password": "securepassword123"
        }
        serializer = RegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.errors, {})

        user = serializer.save()
        self.assertEqual(user.username, "janedoe")
        self.assertNotIn('password', serializer.data)

        serialized = RegisterSerializer(user)
        self.assertNotIn('password', serialized.data)

class FollowTest(TestCase): #testa um usuario seguindo outro
    def test_user_follows_another_user(self):

        user1 = User.objects.create(username='user1', email='user1@example.com')
        user2 = User.objects.create(username='user2', email='user2@example.com')

        user1.following.add(user2)

        self.assertIn(user2, user1.following.all())

        self.assertEqual(user1.following_count, 1)
        self.assertEqual(user2.followers_count, 1)

class PostSerializerTestCase(TestCase): #testa o serializer do post - incompleto
    def setUp(self):
        self.user = User.objects.create_user(
            username="janedoe",
            email="jane@example.com",
            password="securepassword123",
            name="Jane Doe"
        )

    def test_post_serializer_valid_data(self):
        data = {
            "content": "Hello world! This is my first post.",
            "media_url": "https://example.com/image.png"
        }
        serializer = PostSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

        post = serializer.save(author=self.user)
        self.assertEqual(post.content, "Hello world! This is my first post.")
        self.assertEqual(post.author, self.user)

        post.likes.add(self.user)
        self.assertEqual(post.likes_count, 1)
        self.assertIn(self.user, list(post.likes.all()))

        Comment.objects.create(post=post, author=self.user, content="Nice post!")

        self.assertEqual(post.comments_count,1)
        self.assertTrue(post.comments.filter(author=self.user).exists())

class SocialAppAPITests(APITestCase): #testa rotas

    def setUp(self):
        self.user1 = User.objects.create_user(
            username='userone',
            email='user1@example.com',
            password='Password123!',
            name='User One'
        )
        self.user2 = User.objects.create_user(
            username='usertwo',
            email='user2@example.com',
            password='Password123!',
            name='User Two'
        )
        self.post = Post.objects.create(
            author=self.user1,
            content="Hello world from user 1"
        )

    def test_user_registration(self):
        url = reverse('register')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'StrongPassword123!',
            'name': 'New User',
            'bio': 'Welcome to my profile'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_get_user_profile(self):
        url = reverse('user-profile', kwargs={'username': self.user1.username})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user1.email)

    def test_follow_and_unfollow_user(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('follow-toggle', kwargs={'username': self.user2.username})

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(self.user1.following.filter(id=self.user2.id).exists())

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(self.user1.following.filter(id=self.user2.id).exists())

    def test_cannot_follow_self(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('follow-toggle', kwargs={'username': self.user1.username})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_post(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('post-list-create')
        data = {'content': 'Another great post!'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Post.objects.count(), 2)

    def test_list_posts(self):
        url = reverse('post-list-create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)


    def test_update_post_author(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('post-detail', kwargs={'pk': self.post.pk})
        data = {'content': 'Updated post content'}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.post.refresh_from_db()
        self.assertEqual(self.post.content, 'Updated post content')

    def test_delete_post_unauthorized(self):
        self.client.force_authenticate(user=self.user2)
        url = reverse('post-detail', kwargs={'pk': self.post.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_like_toggle(self):
        self.client.force_authenticate(user=self.user2)
        url = reverse('post-like', kwargs={'pk': self.post.pk})

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(self.post.likes.filter(id=self.user2.id).exists())

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(self.post.likes.filter(id=self.user2.id).exists())

    def test_repost_toggle(self):
        self.client.force_authenticate(user=self.user2)
        url = reverse('post-repost', kwargs={'pk': self.post.pk})

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(self.post.reposts.filter(id=self.user2.id).exists())

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(self.post.reposts.filter(id=self.user2.id).exists())