#!/usr/bin/python
# -*- coding: shift_jis -*-

# Create your views here.
import datetime
import csv
import string
from delivery.models import *
from product.models import *
from django.http import HttpResponse
from django.utils import simplejson
from param.views import *

def add_new_delivery_ext( request ) :
    #print request
    postfee = request.POST['postfee']
    transportfee = request.POST['transportfee']
    destination = request.POST['destination']
    items = request.POST['items']
    getSingleLog().info('delivery added, postfee:%s,tranportfee:%s,destination:%s,items:%s',
        postfee, transportfee, destination, items)

    d = Delivery()
    d.deliverydate = datetime.date.today().strftime('%Y-%m-%d')
    results = Delivery.objects.filter( deliverydate =
                                       d.deliverydate ).order_by('-branch')
    if len(results) == 0 :
        d.branch = 1
    else :
        d.branch = results[0].branch + 1
    d.destination = destination
    d.postfee = int(postfee)
    d.transportfee = int(transportfee)
    d.save()

    results = items.split(',')
    for idx in range(len(results))[:-1:3] :
        getSingleLog().debug( results[idx] )
        di = DeliveryItem()
        di.delivery = d
        di.product = Product.objects.get( code = results[idx] )
        di.price = int(results[idx+1])
        di.count = int(results[idx+2])
        di.save()

    result = {
        'errors': {},
        'text': {},
        'success': True,
    }
    return HttpResponse( simplejson.dumps(result), mimetype = 'text/html;' )

def list_delivery_ext( request ) :
    startdate = request.POST['startdate']
    enddate   = request.POST['enddate']
    getSingleLog().info('delivery listed, startdate:%s,enddate:%s',
        startdate, enddate)

    results = Delivery.objects.filter( deliverydate__gte =
                                       datetime.datetime.strptime(startdate,'%Y-%m-%d'),
                                       deliverydate__lte =
                                       datetime.datetime.strptime(enddate,'%Y-%m-%d') )

    root_name = 'root'
    contents = []
    for r in results :
        temp = {}
        temp['date'] = r.deliverydate.strftime('%Y-%m-%d')
        temp['branch'] = r.branch
        temp['destination'] = r.destination
        temp['postfee'] = str(r.postfee)
        temp['transportfee'] = str(r.transportfee)
        items = DeliveryItem.objects.filter( delivery = r )
        totalcost = 0
        for item in items :
            totalcost = totalcost + item.price * item.count
        temp['totalcost'] = totalcost
        contents.append( temp )
    data = {}
    data['total'] = results.count()
    data['root'] = contents
    # print simplejson.dumps(data)
    return HttpResponse( simplejson.dumps(data), mimetype = 'text/javascript;' )

def delete_delivery_ext( request ) :
    date = request.POST['date']
    branch = request.POST['branch']
    getSingleLog().info('delivery deleted, date:%s,branch:%s',
        date, branch)

    obj = Delivery.objects.get( deliverydate =
                                datetime.datetime.strptime(date,'%Y-%m-%d'),
                                branch = branch )
    relations = DeliveryItem.objects.filter( delivery = obj )

    result = {}
    relations.delete()
    getSingleLog().info('delivery items deleted, date:%s,branch:%s',
        date, branch)

    obj.delete()
    result['errors'] = {}
    result['errors']['reason'] = ''
    result['success'] = True
    return HttpResponse( simplejson.dumps(result), mimetype = 'text/javascript;' )

def list_items_ext( request ) :
    date = request.POST['date']
    branch = request.POST['branch']
    getSingleLog().info('delivery items listed, date:%s,branch:%s',
        date, branch)

    results = DeliveryItem.objects.filter( delivery__deliverydate =
                                       datetime.datetime.strptime(date,'%Y-%m-%d'),
                                       delivery__branch = branch )

    root_name = 'root'
    contents = []
    for r in results :
        temp = {}
        temp['productcode'] = r.product.code
        temp['product'] = r.product.display_name
        temp['price'] = r.price
        temp['count'] = r.count
        contents.append( temp )
    data = {}
    data['total'] = results.count()
    data['root'] = contents
    # print simplejson.dumps(data)
    return HttpResponse( simplejson.dumps(data), mimetype = 'text/javascript;' )

def update_delivery_ext( request ) :
    #print request
    date = request.POST['date']
    branch = request.POST['branch']
    postfee = request.POST['postfee']
    transportfee = request.POST['transportfee']
    destination = request.POST['destination']
    items = request.POST['items']
    getSingleLog().info('delivery updated, date:%s,branch:%s,postfee:%s,tranportfee:%s,destination:%s,items:%s',
        date, branch, postfee, transportfee, destination, items)

    obj = Delivery.objects.get( deliverydate =
                                datetime.datetime.strptime(date,'%Y-%m-%d'),
                                branch = branch )
    relations = DeliveryItem.objects.filter( delivery = obj )
    relations.delete()

    obj.destination = destination
    obj.postfee = int(postfee)
    obj.transportfee = int(transportfee)
    obj.save()

    results = items.split(',')
    for idx in range(len(results))[:-1:3] :
        getSingleLog().debug( results[idx] )
        di = DeliveryItem()
        di.delivery = obj
        di.product = Product.objects.get( code = results[idx] )
        di.price = int(results[idx+1])
        di.count = int(results[idx+2])
        di.save()

    result = {
        'errors': {},
        'text': {},
        'success': True,
    }
    return HttpResponse( simplejson.dumps(result), mimetype = 'text/html;' )

def csv_output_ext( request ) :
    date = request.POST['date']
    branch = request.POST['branch']
    getSingleLog().info('delivery csv outputed, date:%s,branch:%s',
        date, branch)

    obj = Delivery.objects.get( deliverydate =
                                datetime.datetime.strptime(date,'%Y-%m-%d'),
                                branch = branch )
    items = DeliveryItem.objects.filter( delivery = obj )

    totalcost = 0
    contents = []
    for item in items :
        totalcost = totalcost + item.price * item.count
        contents.append(('%s,%d,%d' % (item.product.display_name,item.price,item.count)))

    filename = '%s_%s_csv_%s.csv' % ( date, branch, datetime.datetime.now().strftime('%Y%m%d%H%M%S') )
    cw = csv.writer(open('csv/' + filename, 'wb'))
    header = string.join(['日付','枝','コスト総額','郵便料金','交通料金','郵便先'], ',')
    cw.writerow(header.split(','))
    content = '%s,%s,%s,%s,%s,%s' % ( obj.deliverydate.strftime('%Y-%m-%d'), obj.branch, totalcost, obj.postfee, obj.transportfee, obj.destination )
    cw.writerow(content.encode('shift_jis').split(','))
    subheader = '商品名,プライス,個数'
    cw.writerow(subheader.split(','))
    for c in contents :
        getSingleLog().debug( c )
        cw.writerow( c.encode('shift_jis').split(',') )

    result = {}
    result['filename'] = '/csv/' + filename
    result['success'] = True
    getSingleLog().debug( filename )
    return HttpResponse(simplejson.dumps(result), mimetype='text/javascript')
