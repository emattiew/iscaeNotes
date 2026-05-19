from rest_framework.routers import DefaultRouter

from .views import (
    ModuleViewSet,
    MatiereViewSet,
    FiliereViewSet,
    CollecteViewSet,
    StudentNoteViewSet,
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
urlpatterns = router.urls