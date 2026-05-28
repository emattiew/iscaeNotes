from django.contrib import admin
from django.urls import path, include

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [

    path('admin/', admin.site.urls),

    # JWT
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),

    # Accounts
    path('api/accounts/', include('apps.accounts.urls')),

    path('api/notes/', include('apps.notes.urls')),

    path(
    'api/ocr/',include('apps.ocr.urls')
),
]