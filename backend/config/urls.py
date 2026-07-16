from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
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
    'api/ocr/',include('apps.ocr.urls')),

    path(
    "api/ai-correction/",include("apps.ai_correction.urls")),
]
if settings.DEBUG:

    urlpatterns += static(

        settings.MEDIA_URL,

        document_root=settings.MEDIA_ROOT

    )