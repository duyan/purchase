#!/usr/bin/python
# -*- coding: utf-8 -*-

# Create your views here.
from param.views import *
from param.models import *
from param.const import *
from station.models import *
from depart.models import *
from product.models import *
from django.http import HttpResponse
from django.utils import simplejson

def add_new_depart_ext( request ) :
    full_name = request.POST['full_name']
    display_name = request.POST['display_name']
    station = request.POST['station']
    getSingleLog().info('depart added, full_name:%s,display_name:%s,station:%s',
        full_name, display_name, station)

    object_num = get_number( DEPART_NUMBERMANAGE_CODE )
    p = Depart()
    p.code = object_num
    p.full_name = full_name
    p.display_name = display_name
    p.station = Station.objects.get( code=station )
    p.save()
    result = {
        'errors': {},
        'text': {},
        'success': True,
    }
    return HttpResponse( simplejson.dumps(result), mimetype = 'text/javascript;' )

def list_depart_ext( request ) :
    station_type = request.POST['station_type']
    getSingleLog().info('depart listed, station_type:%s',
        station_type)

    if station_type :
        results = Depart.objects.filter(station__station_type__code = station_type)
    else :
        results = Depart.objects.all()
    root_name = 'root'
    contents = []
    for r in results :
        temp = {}
        temp['code'] = r.code
        temp['full_name'] = r.full_name
        temp['display_name'] = r.display_name
        temp['station_code'] = r.station.code
        temp['station'] = r.station.display_name
        contents.append( temp )
    data = {}
    data['total'] = results.count()
    data['root'] = contents
#    print simplejson.dumps(data)
    return HttpResponse( simplejson.dumps(data), mimetype = 'text/javascript;' )


def update_depart_ext( request ) :
    code = request.POST['code']
    full_name = request.POST['full_name']
    display_name = request.POST['display_name']
    station = request.POST['station']
    getSingleLog().info('depart updated, code:%s,full_name:%s,display_name:%s,station:%s',
        code, full_name, display_name, station)

    p = Depart.objects.get( code = code )
    p.full_name = full_name
    p.display_name = display_name
    p.station = Station.objects.get( code=station )
    p.save()
    result = {
        'errors': {},
        'text': {},
        'success': True,
    }
    return HttpResponse( simplejson.dumps(result), mimetype = 'text/javascript;' )

def delete_depart_ext( request ) :
    objcode = request.POST['code']
    getSingleLog().info('depart deleted, objcode:%s', objcode)

    p = Depart.objects.get( code=objcode )
    relations = Price.objects.filter( depart__code = objcode )
    result = {}
    if len( relations ) == 0 :
        getSingleLog().info('depart delete completed, objcode:%s', objcode)
        p.delete()
        result['errors'] = ''
        result['success'] = True
    else :
        getSingleLog().info('depart delete not completed for being referenced, objcode:%s', objcode)
        result['success'] = False
        result['errors'] = 'depart has been referenced'
    return HttpResponse( simplejson.dumps(result), mimetype = 'text/javascript;' )
