from django.test import TestCase
from .serializers import RegisterSerializer


class SerializerTestCase(TestCase):
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