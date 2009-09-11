from django.db import models
from depart.models import *
from param.models import *

# Create your models here.
class Product( models.Model ) :
    code            = models.CharField( max_length = 10 )
    full_name       = models.CharField( max_length = 80 ) # 40 kanji
    display_name    = models.CharField( max_length = 40 ) # 20 kanji
    category        = models.ForeignKey( Category )
    preview         = models.ImageField( upload_to = 'img')

class Price( models.Model ) :
    product = models.ForeignKey( Product )
    depart  = models.ForeignKey( Depart )
    discount_price = models.IntegerField( )
    regular_price = models.IntegerField( )
