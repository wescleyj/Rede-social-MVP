from django.test import TestCase
from .serializers import RegisterSerializer, PostSerializer
from .models import User

## FAZER USUARIO DAR LIKE E TESTAR

class SerializerTestCase(TestCase): #testa o serializer criado pra usuario
    def test_serializer_valid_data(self):
        data = {
            "username": "janedoe",
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