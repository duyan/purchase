from django.db import models
from product.models import *
from param.models import *

# Create your models here.
class Delivery( models.Model ) :
    deliverydate    = models.DateField()
    branch          = models.IntegerField()
    destination     = models.CharField( max_length = 40 )
    postfee         = models.IntegerField()
    transportfee    = models.IntegerField()

class DeliveryItem( models.Model ) :
    delivery = models.ForeignKey( Delivery )
    product  = models.ForeignKey( Product )
    price    = models.IntegerField()
    count    = models.IntegerField()
