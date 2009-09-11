# Create your views here.
from param.models import StationType
from param.views import *
from param.const import *
from station.models import *
from depart.models import *
from django.http import HttpResponse
from django.utils import simplejson

def add_new_station_ext( request ) :
    #print request
    full_name = request.POST['full_name']
    display_name = request.POST['display_name']
    station_type = request.POST['stationtype']
    getSingleLog().info('station added, full_name:%s,display_name:%s,station_type:%s',
        full_name, display_name, station_type)

    object_num = get_number( STATION_NUMBERMANAGE_CODE )
    s = Station()
    s.code = object_num
    s.full_name = full_name
    s.display_name = display_name
    s.station_type = StationType.objects.get( code = station_type )
    s.save()
    result = {
        'errors': {},
        'text': {},
        'success': True,
    }
    return HttpResponse( simplejson.dumps(result), mimetype = 'text/javascript;' )

def list_station_ext( request ):
#    print request
    station_type = request.POST['station_type']
    getSingleLog().info('station listed, station_type:%s', station_type)

    if station_type :
        results = Station.objects.filter(station_type__code = station_type)
    else :
        results = Station.objects.all()
    root_name = 'root'
    contents = []
    for r in results :
        temp = {}
        temp['code'] = r.code
        temp['full_name'] = r.full_name
        temp['display_name'] = r.display_name
        temp['station_type'] = r.station_type.display_name
        temp['stationtypecode'] = r.station_type.code
        contents.append( temp )
    data = {}
    data['total'] = results.count()
    data['root'] = contents
#    print simplejson.dumps(data)
    return HttpResponse( simplejson.dumps(data), mimetype = 'text/javascript;' )

def delete_station_ext( request ) :
    objcode = request.POST['code']
    getSingleLog().info('station deleted, objcode:%s', objcode)

    p = Station.objects.get( code=objcode )
    relations = Depart.objects.filter( station__code=objcode )
    result = {}
    if len( relations ) == 0 :
        p.delete()
        result['errors'] = {}
        result['errors']['reason'] = ''
        result['success'] = True
    else :
        result['errors'] = {}
        result['success'] = False
        result['errors']['reason'] = 'station has been referenced'
    return HttpResponse( simplejson.dumps(result), mimetype = 'text/javascript;' )

def update_station_ext( request ) :
    #print request
    objcode = request.POST['code']
    full_name = request.POST['full_name']
    display_name = request.POST['display_name']
    station_type = request.POST['stationtype']
    getSingleLog().info('station updated, objcode:%s,full_name:%s,display_name:%s,station_type:%s',
        objcode, full_name, display_name, station_type)

    s = Station.objects.get( code = objcode )
    s.full_name = full_name
    s.display_name = display_name
    s.station_type = StationType.objects.get( code = station_type )
    s.save()
    result = {
        'errors': {},
        'text': {},
        'success': True,
    }
    return HttpResponse( simplejson.dumps(result), mimetype = 'text/javascript;' )
