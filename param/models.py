from django.db import models

# Create your models here.
class StationType( models.Model ) :
    code         = models.CharField( max_length = 2 )
    full_name    = models.CharField( max_length = 50 ) # 25 kanji
    display_name = models.CharField( max_length = 20 ) # 10 kanji

    def __unicode__( self ) :
        return self.display_name

class NumberManage( models.Model ) :
    code = models.CharField( max_length = 5 )
    current_number = models.CharField( max_length = 10 )
    minimun_number = models.CharField( max_length = 10 )
    maximun_number = models.CharField( max_length = 10 )
    number_length = models.IntegerField( )

class Category( models.Model ) :
    code         = models.CharField( max_length = 2 )
    full_name    = models.CharField( max_length = 50 ) # 25 kanji
    display_name = models.CharField( max_length = 20 ) # 10 kanji

    def __unicode__( self ) :
        return self.display_name
