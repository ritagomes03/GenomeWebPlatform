from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'taxonomy', views.TaxonomyViewSet, basename='taxonomy')
router.register(r'sequences', views.SequenceViewSet, basename='sequence')
router.register(r'global', views.GlobalViewSet, basename='global')

urlpatterns = router.urls
