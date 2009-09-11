from django.db import models
from station.models import *

# Create your models here.
class Depart( models.Model ) :
    code            = models.CharField( max_length = 10 )
    full_name       = models.CharField( max_length = 80 ) # 40 kanji
    display_name    = models.CharField( max_length = 40 ) # 20 kanji
    station         = models.ForeignKey( Station ) # from station app

