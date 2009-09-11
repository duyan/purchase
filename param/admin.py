from django.db import models
from django.contrib import admin
from param.models import *

class StationTypeAdmin(admin.ModelAdmin) :
    list_display = ['code', 'full_name', 'display_name']
    list_display_links = ['code', 'full_name', 'display_name']
    ordering = ['code']

admin.site.register(StationType, StationTypeAdmin)

class NumberManageAdmin(admin.ModelAdmin) :
    list_display = ['code', 'current_number', 'minimun_number', 'maximun_number', 'number_length']
    list_display_links = ['code', 'current_number', 'minimun_number', 'maximun_number', 'number_length']
    ordering = ['code']

admin.site.register(NumberManage, NumberManageAdmin)
