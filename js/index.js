Ext.onReady(function(){

        Ext.QuickTips.init();

        // turn on validation errors beside the field globally
        Ext.form.Field.prototype.msgTarget = 'side';

        var bd = Ext.getBody();

        var station = new Ext.Button({
                id: 'station',
                text: '駅',
                width: 60,
                height: 60,
                hidden: false,
                handler: function() {
                        Ext.get('station').frame('ff0000', 1);
                        window.location = '/site_media/template/station.html';
                }
            });

        var depart = new Ext.Button({
                id: 'depart',
                text: 'デパート',
                width: 60,
                height: 60,
                hidden: false,
                listeners: {
                    click: function( b, e ) {
                        Ext.get('depart').frame('ff0000', 1);
                        window.location = '/site_media/template/depart.html';
                    }
                }
            });

        var product = new Ext.Button({
                id: 'product',
                text: '商品',
                width: 60,
                height: 60,
                hidden: false,
                listeners: {
                    click: function( b, e ) {
                        Ext.get('product').frame('ff0000', 1);
                        window.location = '/site_media/template/product.html';
                    }
                }
            });

        var delivery = new Ext.Button({
                id: 'delivery',
                text: 'デリバリー',
                width: 60,
                height: 60,
                hidden: false,
                listeners: {
                    click: function( b, e ) {
                        Ext.get('delivery').frame('ff0000', 1);
                        window.location = '/site_media/template/delivery.html';
                    }
                }
            });

        station.render(document.body);
        depart.render(document.body);
        product.render(document.body);
        delivery.render(document.body);
        station.getEl().setLocation(60,60);
        depart.getEl().setLocation(220,60);
        product.getEl().setLocation(60,160);
        delivery.getEl().setLocation(220,160);

    });
