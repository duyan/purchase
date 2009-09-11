# Create your views here.
from param.views import *
from param.models import *
from param.const import *
from station.models import *
from depart.models import *
from product.models import *
from delivery.models import *
from django.http import HttpResponse
from django.utils import simplejson
from StringIO import StringIO

def add_new_product_ext( request ) :
    #print request
    full_name = request.POST['full_name']
    display_name = request.POST['display_name']
    category = request.POST['category']
    getSingleLog().info('product added, full_name:%s,display_name:%s,category:%s,photo:%s',
        full_name, display_name, category, request.FILES['photo-path'].name)

    object_num = get_number( PRODUCT_NUMBERMANAGE_CODE )
    p = Product()
    p.code = object_num
    p.full_name = full_name
    p.display_name = display_name
    p.category = Category.objects.get( code = category )
    handle_uploaded_file(request.FILES['photo-path'], object_num)
    p.preview = object_num + '_' + request.FILES['photo-path'].name
    p.save()
    result = {
        'errors': {},
        'text': {},
        'file': object_num + '_' + request.FILES['photo-path'].name,
        'success': True,
    }
    return HttpResponse( simplejson.dumps(result), mimetype = 'text/html;' )

def handle_uploaded_file(f, code) :
    getSingleLog().info('product photo writed, photo:%s',
        'img/' + code + '_' + f.name)
    destination = open('img/' + code + '_' + f.name, 'wb+')
    for chunk in f.chunks():
        destination.write(chunk)
    destination.close()

def list_product_ext( request ) :
    category = request.POST['category']
    getSingleLog().info('product listed, category:%s', category)

    if category :
        results = Product.objects.filter(category__code = category)
    else :
        results = Product.objects.all()
    root_name = 'root'
    contents = []
    for r in results :
        temp = {}
        temp['code'] = r.code
        temp['full_name'] = r.full_name
        temp['display_name'] = r.display_name
        temp['category'] = r.category.display_name
        temp['categorycode'] = r.category.code
        temp['preview'] = r.preview.url
        prices = Price.objects.filter( product = r ).order_by('discount_price')
        if len( prices ) == 0 :
            temp['price'] = 0
            temp['depart'] = ''
        else :
            temp['price'] = prices[0].discount_price
            temp['depart'] = prices[0].depart.display_name
        contents.append( temp )
    data = {}
    data['total'] = results.count()
    data['root'] = contents
    # print simplejson.dumps(data)
    return HttpResponse( simplejson.dumps(data), mimetype = 'text/javascript;' )


def list_price_ext( request ) :
    objcode = request.POST['productcode']
    getSingleLog().info('product price listed, objcode:%s', objcode)

    results = Price.objects.filter(product__code = objcode)
    root_name = 'root'
    contents = []
    for r in results :
        temp = {}
        temp['depart'] = r.depart.display_name + '(' + r.depart.station.display_name + ')'
        temp['departcode'] = r.depart.code
        temp['discount_price'] = r.discount_price
        temp['regular_price'] = r.regular_price
        contents.append( temp )
    data = {}
    data['total'] = results.count()
    data['root'] = contents
    # print simplejson.dumps(data)
    return HttpResponse( simplejson.dumps(data), mimetype = 'text/javascript;' )

def add_price_ext( request ) :
    #print request
    discountprice = request.POST['discountprice']
    regularprice = request.POST['regularprice']
    productcode = request.POST['productcode']
    departcode = request.POST['departcode']
    getSingleLog().info('product price added, departcode:%s,productcode:%s,discountprice:%s,regularprice:%s',
        departcode, productcode, discountprice, regularprice)

    e = Price.objects.filter( product__code = productcode, depart__code = departcode )
    result = {}
    if len(e) != 0 :
        #result['errors'] = {}
        result['text'] = ''
        result['success'] = True
        result['errors'] = 'already exist'
        getSingleLog().info('product price already existed, departcode:%s,productcode:%s,discountprice:%s,regularprice:%s',
            departcode, productcode, discountprice, regularprice)
    else :
        p = Price()
        p.product = Product.objects.get( code = productcode )
        p.depart = Depart.objects.get( code = departcode )
        p.discount_price = int(discountprice)
        p.regular_price = int(regularprice)
        p.save()
        getSingleLog().info('product price add completed, departcode:%s,productcode:%s,discountprice:%s,regularprice:%s',
            departcode, productcode, discountprice, regularprice)
        result['errors'] = ''
        result['text'] = ''
        result['success'] = True
    #print result
    return HttpResponse( simplejson.dumps(result), mimetype = 'text/javascript;' )

def del_price_ext( request ) :
    #print request
    productcode = request.POST['productcode']
    departcode = request.POST['departcode']
    getSingleLog().info('product price deleted, departcode:%s,productcode:%s',
            departcode, productcode)

    p = Price.objects.get( product__code = productcode, depart__code = departcode )
    p.delete()
    result = {
        'errors': {},
        'text': {},
        'success': True,
    }
    return HttpResponse( simplejson.dumps(result), mimetype = 'text/html;' )

def update_product_ext( request ) :
    #print request
    objcode = request.POST['code']
    full_name = request.POST['full_name']
    display_name = request.POST['display_name']
    category = request.POST['category']
    getSingleLog().info('product updated, objcode:%s,full_name:%s,display_name:%s,category:%s,photo:%s',
        objcode, full_name, display_name, category, request.FILES.get('photo-path',None))

    p = Product.objects.get( code = objcode )
    p.full_name = full_name
    p.display_name = display_name
    p.category = Category.objects.get( code = category )
    if request.FILES.get('photo-path',None) :
        handle_uploaded_file(request.FILES['photo-path'], objcode)
        p.preview = objcode + '_' + request.FILES['photo-path'].name
    p.save()
    result = {
        'errors': {},
        'text': {},
        'file': p.preview.url,
        'success': True,
    }
    return HttpResponse( simplejson.dumps(result), mimetype = 'text/html;' )

def delete_product_ext( request ) :
    objcode = request.POST['code']
    getSingleLog().info('product deleted, objcode:%s', objcode)

    p = Product.objects.get( code=objcode )
    relations = DeliveryItem.objects.filter( product = p )

    result = {}
    if len(relations) == 0 :
        prices = Price.objects.filter( product__code = objcode )
        for r in prices :
            r.delete()
        p.delete()
        result['errors'] = ''
        result['success'] = True
    else :
        result['success'] = False
        result['errors'] = 'product has been referenced'

    return HttpResponse( simplejson.dumps(result), mimetype = 'text/javascript;' )
