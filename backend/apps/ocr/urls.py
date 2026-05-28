from django.urls import path

from .views import OCRUploadView


urlpatterns = [

    path(
        'upload/',
        OCRUploadView.as_view(),
    ),
]