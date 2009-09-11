# Create your views here.
from django.db import models
from param.models import *
from django.http import HttpResponse
from django.core import serializers
from django.utils import simplejson
import logging
import sys

def get_number( target ) :
    n = NumberManage.objects.get( code=target )
    format = '%d' % n.number_length
    format = '%0' + format + 'd'
    current = format % ( int( n.current_number ) + 1 )
    if current > n.maximun_number :
        return -1
    else :
        n.current_number = current
        n.save()
        return current

def get_stationtype_list( request ) :
    results = StationType.objects.all()
    root_name = 'root'
    data = '{"total": %s, "%s": %s}' % \
           ( results.count(), root_name, serializers.serialize('json', results, fields=('code','display_name')) )
    return HttpResponse(data, mimetype = 'text/javascript;')

def get_category_list( request ) :
    results = Category.objects.all()
    root_name = 'root'
    data = '{"total": %s, "%s": %s}' % \
           ( results.count(), root_name, serializers.serialize('json', results, fields=('code','display_name')) )
    return HttpResponse( data, mimetype = 'text/javascript;' )

class SingleLog():
    mylogger = None
    formatter = None
    hdlr = None

def getSingleLog():
    if SingleLog.mylogger == None:
        print '******************create logger******************'
        SingleLog.mylogger = logging.getLogger('purchase')
        SingleLog.hdlr = logging.FileHandler('log/operations.log', encoding='utf_8')
        SingleLog.formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
        SingleLog.hdlr.setFormatter(SingleLog.formatter)
        SingleLog.mylogger.addHandler(SingleLog.hdlr)
        SingleLog.mylogger.setLevel(logging.INFO)
    return SingleLog.mylogger
