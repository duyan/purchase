from django.conf.urls.defaults import *
from django.conf import settings

import purchase.station.views
import purchase.depart.views
import purchase.param.views
import purchase.product.views
import purchase.delivery.views

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Example:
    # (r'^purchase/', include('purchase.foo.urls')),

    # Uncomment the admin/doc line below and add 'django.contrib.admindocs'
    # to INSTALLED_APPS to enable admin documentation:
    # (r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    (r'^admin/(.*)', admin.site.root),
    (r'^site_media/(?P<path>.*)$', 'django.views.static.serve',
     {'document_root': settings.STATIC_DOC_ROOT}),
    (r'^param/liststationtype/$',purchase.param.views.get_stationtype_list),
    (r'^param/listcategory/$',purchase.param.views.get_category_list),
    (r'^station/addext/$',purchase.station.views.add_new_station_ext),
    (r'^station/listext/$',purchase.station.views.list_station_ext),
    (r'^station/updateext/$',purchase.station.views.update_station_ext),
    (r'^station/deleteext/$',purchase.station.views.delete_station_ext),
    (r'^depart/addext/$',purchase.depart.views.add_new_depart_ext),
    (r'^depart/listext/$',purchase.depart.views.list_depart_ext),
    (r'^depart/updateext/$',purchase.depart.views.update_depart_ext),
    (r'^depart/deleteext/$',purchase.depart.views.delete_depart_ext),
    (r'^product/listext/$',purchase.product.views.list_product_ext),
    (r'^product/addext/$',purchase.product.views.add_new_product_ext),
    (r'^product/updateext/$',purchase.product.views.update_product_ext),
    (r'^product/deleteext/$',purchase.product.views.delete_product_ext),
    (r'^product/listpriceext/$',purchase.product.views.list_price_ext),
    (r'^product/addpriceext/$',purchase.product.views.add_price_ext),
    (r'^product/delpriceext/$',purchase.product.views.del_price_ext),
    (r'^delivery/addext/$',purchase.delivery.views.add_new_delivery_ext),
    (r'^delivery/updateext/$',purchase.delivery.views.update_delivery_ext),
    (r'^delivery/listext/$',purchase.delivery.views.list_delivery_ext),
    (r'^delivery/listitemsext/$',purchase.delivery.views.list_items_ext),
    (r'^delivery/deleteext/$',purchase.delivery.views.delete_delivery_ext),
    (r'^delivery/csvoutputext/$',purchase.delivery.views.csv_output_ext),
    (r'^(?P<path>.*)$', 'django.views.static.serve',
     {'document_root': settings.STATIC_DOC_ROOT + 'template/'}),
#    (r'^station/(d+)/$',views.update_station),

)
