from django.urls import path

from .views import (
    OCRUploadView,
    OCRImportPreviewView,
    OCRImportView
)


urlpatterns = [

    path(
        'upload/',
        OCRUploadView.as_view(),
    ),

    path(
        'import-preview/',
        OCRImportPreviewView.as_view(),
    ),

    path(
        'import/',
        OCRImportView.as_view(),
    ),
]