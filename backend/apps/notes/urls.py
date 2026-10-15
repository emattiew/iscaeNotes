from django.urls import path

from rest_framework.routers import DefaultRouter

from .views import (
    ModuleViewSet,
    MatiereViewSet,
    FiliereViewSet,
    CollecteViewSet,
    StudentNoteViewSet,
    ReclamationViewSet,
    ReclamationPeriodViewSet,
    ReclamationPeriodStatusViewSet,
    
)

router = DefaultRouter()

router.register(
    'modules',
    ModuleViewSet,
    basename='modules'
)

router.register(
    'matieres',
    MatiereViewSet,
    basename='matieres'
)

router.register(
    'filieres',
    FiliereViewSet,
    basename='filieres'
)

router.register(
    'collectes',
    CollecteViewSet,
    basename='collectes'
)

router.register(
    'student-notes',
    StudentNoteViewSet,
    basename='student-notes'
)
router.register(
    'reclamation-periods',
    ReclamationPeriodViewSet,
    basename='reclamation-periods'
)
router.register(
    'reclamations',
    ReclamationViewSet,
    basename='reclamations'
)

router.register(
    'reclamation-period-status',
    ReclamationPeriodStatusViewSet,
    basename='reclamation-period-status'
)

urlpatterns = router.urls