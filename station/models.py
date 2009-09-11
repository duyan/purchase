from django.db import models
from param.models import *

# Create your models here.
class Station( models.Model ) :
    code         = models.CharField( max_length = 10 )
    full_name    = models.CharField( max_length = 80 ) # 40 kanji
    display_name = models.CharField( max_length = 40 ) # 20 kanji
    station_type = models.ForeignKey( StationType ) # from param app

    def __unicode__( self ) :
        return self.display_name + '(' + self.station_type.display_name + ')'
