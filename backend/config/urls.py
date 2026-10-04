"""
URL configuration for EthAum project.
"""
from django.contrib import admin
from django.urls import path
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({'status': 'ok', 'project': 'EthAum API', 'tagline': 'Global Care. Closer to You.'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health-check'),
]
