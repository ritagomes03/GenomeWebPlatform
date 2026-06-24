from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from .models import ContactMessage


class ContactMessageTests(APITestCase):
    def setUp(self):
        self.url = reverse('contact-list')

        self.valid_payload = {
            'name': 'Ana Gomes',
            'email': 'ana@example.com',
            'category': 'genomic_metrics',
            'subject': 'Question about entropy',
            'message': (
                'I would like to understand how the normalized '
                'compression-based entropy is calculated.'
            ),
        }

    def test_create_contact_message(self):
        response = self.client.post(
            self.url,
            self.valid_payload,
            format='json',
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            ContactMessage.objects.count(),
            1,
        )

        contact_message = ContactMessage.objects.first()

        self.assertEqual(
            contact_message.email,
            'ana@example.com',
        )

        self.assertEqual(
            contact_message.status,
            'new',
        )

    def test_contact_messages_cannot_be_publicly_listed(self):
        ContactMessage.objects.create(
            **self.valid_payload
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def test_invalid_email_is_rejected(self):
        payload = {
            **self.valid_payload,
            'email': 'invalid-email',
        }

        response = self.client.post(
            self.url,
            payload,
            format='json',
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            'email',
            response.data,
        )

    def test_short_message_is_rejected(self):
        payload = {
            **self.valid_payload,
            'message': 'Hello',
        }

        response = self.client.post(
            self.url,
            payload,
            format='json',
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            'message',
            response.data,
        )