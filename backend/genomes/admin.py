from django.contrib import admin

from .models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = [
        'subject',
        'name',
        'email',
        'category',
        'status',
        'created_at',
    ]

    list_filter = [
        'status',
        'category',
        'created_at',
    ]

    search_fields = [
        'name',
        'email',
        'subject',
        'message',
    ]

    readonly_fields = [
        'name',
        'email',
        'category',
        'subject',
        'message',
        'created_at',
        'updated_at',
    ]

    ordering = [
        '-created_at',
    ]

    actions = [
        'mark_as_in_review',
        'mark_as_answered',
        'mark_as_closed',
    ]

    fieldsets = [
        (
            'Contact details',
            {
                'fields': [
                    'name',
                    'email',
                ],
            },
        ),
        (
            'Message',
            {
                'fields': [
                    'category',
                    'subject',
                    'message',
                ],
            },
        ),
        (
            'Management',
            {
                'fields': [
                    'status',
                    'created_at',
                    'updated_at',
                ],
            },
        ),
    ]

    @admin.action(description='Mark selected messages as in review')
    def mark_as_in_review(self, request, queryset):
        queryset.update(status='in_review')

    @admin.action(description='Mark selected messages as answered')
    def mark_as_answered(self, request, queryset):
        queryset.update(status='answered')

    @admin.action(description='Mark selected messages as closed')
    def mark_as_closed(self, request, queryset):
        queryset.update(status='closed')