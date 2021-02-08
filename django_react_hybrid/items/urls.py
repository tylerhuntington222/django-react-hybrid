from django.conf import settings
from django.urls import include, path, re_path
from django.conf.urls.static import static
from .views import ItemsView
from django.contrib import admin
from django.views.decorators.csrf import csrf_exempt
from django.views import defaults as default_views
from graphene_file_upload.django import FileUploadGraphQLView
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.documentation import include_docs_urls
from django.views.generic import TemplateView


urlpatterns = [
    path("", ItemsView.as_view(), name='items'),
]


