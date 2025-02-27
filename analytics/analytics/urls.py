"""
URL configuration for analytics project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from home import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('postFile/', views.TableCreation.as_view(), name = "postFile"),
    path('table_get/', views.GetTable.as_view(), name = 'getTable'),
    path('table_data_get/<str:tableName>/', views.GetTableData.as_view(), name = 'getData'),
    path('table_data_save/<str:tableName>/', views.table_data_save, name = 'table_data_save'),
    path('checkDuplicates/', views.CheckDuplicates.as_view(), name = 'Duplicates'),
    path('plots/<tableName>/', views.Plots.as_view(), name = 'Plots'),
    path('sqllite3_to_excel/', views.ExcelDownload.as_view(), name = 'Excel Download')
]
