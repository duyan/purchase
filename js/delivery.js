Ext.onReady(function(){

        Ext.QuickTips.init();

        // turn on validation errors beside the field globally
        Ext.form.Field.prototype.msgTarget = 'side';

        var categorystore = new Ext.data.Store({
                proxy: new Ext.data.HttpProxy({
                        url: '/param/listcategory/'
                    }),
                reader: new Ext.data.JsonReader({
                        fields: ['code', 'display_name'],
                        root: 'root',
                        totalProperty: 'total',
                        id: 'pk'
                    },
                    [
        {name: 'code', mapping: 'fields.code'},
        {name: 'display_name', mapping: 'fields.display_name'}
                     ]),
                autoLoad: true
            });

        var deliverystore = new Ext.data.Store({
                proxy: new Ext.data.HttpProxy({
                        url: '/delivery/listext/'
                    }),
                reader: new Ext.data.JsonReader({
                        fields: ['date','branch', 'destination', 'postfee','transportfee', 'totalcost'],
                        root: 'root',
                        totalProperty: 'total'
                    },
                    [
        {name: 'date'},
        {name: 'branch'},
        {name: 'destination'},
        {name: 'postfee'},
        {name: 'transportfee'},
        {name: 'totalcost'}
                     ]),
                autoLoad: false
            });

        var bd = Ext.getBody();

        /*
         * ================  Simple form  =======================
         */

        var deliverygrid = new Ext.grid.GridPanel({
                id: 'deliverygrid',
                frame: true,
                title: '一覧',
                tbar: {
                    xtype: 'toolbar',
                    id: 'toolbar',
                    width: 500,
                    items: ['開始日', {
                            xtype: 'datefield',
                            id: 'startdate',
                            name: 'startdate',
                            format: 'Y-m-d',
                            value: new Date(),
                            allowBlank: false
                        },'終了日',{
                            xtype: 'datefield',
                            id: 'enddate',
                            name: 'enddate',
                            format: 'Y-m-d',
                            value: new Date(),
                            allowBlank: false
                        },'-',{
                            text: '検索',
                            handler: listdeliverybydate
                        },'->',{
                            text: '登録',
                            handler: adddelivery
                        },{
                            text: '編集',
                            handler: editdelivery
                        },{
                            text: '削除',
                            handler: deldelivery
                        },'-',{
                            text: 'CSV出力',
                            handler: csvoutput
                        }]
                },
                height: 400,
                width: 650,
                store: deliverystore,
                columns: [
        {header: "日付(枝)", width: 100, sortable: true,
         renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                return value + '(' + deliverystore.getAt(rowIndex).get('branch') + ')';
            },
         dataIndex: 'date'},
        {header: "コスト総額", width:100, sortable: true, dataIndex: 'totalcost'},
        {header: "郵便料金", width: 120, sortable: true, dataIndex: 'postfee'},
        {header: "交通料金", width: 120, sortable: true, dataIndex: 'transportfee'},
        {header: "郵便先", width: 120, sortable: false, dataIndex: 'destination'}
                          ],
                sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
                stripeRows: true
            });
        deliverygrid.render(document.body);

        function listdeliverybydate(btn) {
            if ( Ext.getCmp('startdate').getValue().format('Y-m-d') >
                 Ext.getCmp('enddate').getValue().format('Y-m-d') ) {
                Ext.Msg.show({
                        title: 'Warning',
                            buttons: Ext.MessageBox.OK,
                            msg: '開始日が終了日より小さい！'
                            });
                return;
            }
            deliverystore.reload({params:{startdate:Ext.getCmp('startdate').getValue().format('Y-m-d'),
                            enddate:Ext.getCmp('enddate').getValue().format('Y-m-d')}});
        }

        function adddelivery(btn){
            var productstore = new Ext.data.Store({
                    proxy: new Ext.data.HttpProxy({
                            url: '/product/listext/'
                        }),
                    reader: new Ext.data.JsonReader({
                            fields: ['code','full_name', 'display_name', 'category', 'categorycode', 'preview', 'price', 'depart'],
                            root: 'root',
                            totalProperty: 'total',
                            id: 'code'
                        },
                        [
            {name: 'code'},
            {name: 'full_name'},
            {name: 'display_name'},
            {name: 'category'},
            {name: 'categorycode'},
            {name: 'preview'},
            {name: 'price'},
            {name: 'depart'}
                         ]),
                    autoLoad: false
                });

            var w = new Ext.Window({
                    resizable: false,
                    modal: true,
                    layout: 'border',
                    width: 685,
                    height: 450,

                    items: [{
                            xtype: 'grid',
                            id: 'productgrid',
                            region: 'west',
                            frame: true,
                            title: '一覧',
                            tbar: {
                                xtype: 'toolbar',
                                id: 'producttoolbar',
                                width: 280,
                                items: [ {
                                        xtype: 'combo',
                                        id: 'catecmb',
                                        fieldLabel: 'カテゴリ',
                                        name: 'cate',
                                        store: categorystore,
                                        mode: 'local',
                                        displayField: 'display_name',
                                        valueField: 'code',
                                        hiddenName: 'category',
                                        allowBlank: true,
                                        editable: true,
                                        width: 100,
                                        forceSelection: true
                                    },'-',{
                                        text: '検索',
                                        handler: function(btn){
                                            productstore.reload({params:{category:Ext.getCmp('catecmb').getValue()}});
                                        }
                                    }
                                    ]
                            },
                            height: 450,
                            width: 280,
                            store: productstore,
                            columns: [
            {header: "表示名", width: 120, sortable: true, dataIndex: 'display_name'},
            {header: "カテゴリ", width: 120, sortable: true, dataIndex: 'category'}
                                      ],
                            sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
                            stripeRows: true,
                            listeners : {
                                cellclick : function( g, rowIndex, colIndex, e ) {
                                    var imgtt = new Ext.ToolTip({
                                            target: '',
                                            html: '<img src="/site_media/img/' + g.getStore().getAt( rowIndex ).get('preview') + '">',
                                            hideDelay: 1000
                                        });
                                    imgtt.showAt(e.getXY())
                                    window.setTimeout(function() {
                                            imgtt.hide()
                                                }, 1000);
                                }

                            }
                        },{
                            xtype: 'panel',
                            region: 'center',
                            frame: true,
                            layout: 'absolute',
                            width: 20,
                            anchor: '100%',
                            items: [{
                                    xtype: 'button',
                                    x: 0,
                                    y: 150,
                                    text: '追加',
                                    handler: function(){
                                        var sm = Ext.getCmp('productgrid').getSelectionModel();
                                        if ( !sm.hasSelection() ) {
                                            Ext.Msg.show({
                                                    title: 'Warning',
                                                        buttons: Ext.MessageBox.OK,
                                                        msg: '選択行がありません！'
                                                        });
                                            return;
                                        }
                                        var sel = sm.getSelected();

                                        if ( Ext.getCmp('deliveryitemgrid').getStore()
                                             .find('productcode',sel.data.code,0,false) != -1 ) {
                                            Ext.Msg.show({
                                                    title: 'Warning',
                                                        buttons: Ext.MessageBox.OK,
                                                        msg: '対象が既に追加済、個数のみ変更していい！'
                                                        });
                                            return;
                                        }
                                        var Product = Ext.getCmp('deliveryitemgrid').getStore().recordType;
                                        var p = new Product({
                                                productcode: sel.data.code,
                                                product: sel.data.display_name,
                                                price: sel.data.price,
                                                count: 0
                                            });
                                        Ext.getCmp('deliveryitemgrid').stopEditing();
                                        Ext.getCmp('deliveryitemgrid').getStore().add(p);
                                    }
                                },{
                                    xtype: 'button',
                                    x: 0,
                                    y: 200,
                                    text: '削除',
                                    handler: function(){
                                        var sm = Ext.getCmp('deliveryitemgrid').getSelectionModel();
                                        if ( !sm.hasSelection() ) {
                                            Ext.Msg.show({
                                                    title: 'Warning',
                                                        buttons: Ext.MessageBox.OK,
                                                        msg: '選択行がありません！'
                                                        });
                                            return;
                                        }
                                        var sel = sm.getSelected();

                                        Ext.getCmp('deliveryitemgrid').getStore().remove(sel);

                                    }
                                }
                                ]
                        },{
                            xtype: 'form',
                            id: 'addform',
                            region: 'east',
                            labelWidth: 75,
                            url: '/delivery/addext/',
                            frame: true,
                            title: 'デリバリー登録',
                            bodyStyle: 'padding:5px 5px 0',
                            width: 350,
                            defaultType: 'textfield',
                            method: 'POST',

                            items: [{
                                    fieldLabel: '郵便料金',
                                    name: 'postfee',
                                    width: 200,
                                    value: '0',
                                    allowBlank:false
                                },{
                                    fieldLabel: '交通料金',
                                    name: 'transportfee',
                                    width: 200,
                                    value: '0',
                                    allowBlank:false
                                },{
                                    fieldLabel: '郵便先',
                                    name: 'destination',
                                    width: 200,
                                    allowBlank:false
                                }, {
                                    xtype: 'editorgrid',
                                    id: 'deliveryitemgrid',
                                    store: new Ext.data.Store({
                                            reader: new Ext.data.JsonReader({
                                                    fields: ['productcode','product', 'price', 'count']
                                                }),
                                        }),
                                    cm: new Ext.grid.ColumnModel([{
                                                id: 'productcolumn',
                                                header: '商品名',
                                                dataIndex: 'product',
                                                width: 160,
                                                editable: false,
                                                // use shorthand alias defined above
                                                editor: {
                                                    xtype: 'textfield',
                                                    allowBlank: false
                                                }
                                            },{
                                                header: '単価',
                                                dataIndex: 'price',
                                                width: 70,
                                                editor: {
                                                    xtype: 'numberfield',
                                                    value: 0
                                                }
                                            },{
                                                header: '個数',
                                                dataIndex: 'count',
                                                width: 70,
                                                editor: {
                                                    xtype: 'numberfield',
                                                    value: 0
                                                }
                                            }
                                            ]),
                                    width: 320,
                                    height: 300,
                                    title: 'アイテム',
                                    frame: true,
                                    sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
                                    clicksToEdit: 1
                                }
                                ],

                            buttons: [{
                                    text: '登録',
                                    handler: function(){
                                        if (Ext.getCmp('deliveryitemgrid').getStore().getCount() == 0 ) {
                                            Ext.Msg.show({
                                                    title: '件数確認',
                                                    buttons: Ext.MessageBox.OK,
                                                    msg: 'デリバリー件数がゼロ!'
                                                });
                                            return;
                                        }
                                        Ext.Msg.show({
                                                title: '登録確認',
                                                buttons: Ext.MessageBox.YESNO,
                                                msg: 'よろしいですか',
                                                fn: function(btn){
                                                    if ( btn == 'yes' ) {
                                                        var count = Ext.getCmp('deliveryitemgrid').getStore().getCount();
                                                        var i = 0;
                                                        var items = "";
                                                        for( i = 0; i < count; i++ ) {
                                                            p = Ext.getCmp('deliveryitemgrid').getStore().getAt(i);
                                                            items = items + p.data.productcode + "," + p.data.price + "," + p.data.count + ",";
                                                        }
                                                        Ext.getCmp('addform').getForm().submit({
                                                                //waitMsg: 'アップロード...',
                                                                params: { items: items },
                                                                success: function(f,a){
                                                                    Ext.Msg.alert('Success', '登録成功');
                                                                    listdeliverybydate(null);
                                                                    w.close();
                                                                },
                                                                failure: function(f,a){
                                                                    Ext.Msg.alert('Warning', 'Error');
                                                                }
                                                            })
                                                    }
                                                }
                                            });
                                    }
                                },{
                                    text: 'リセット',
                                    handler: function() {
                                        Ext.getCmp('addform').getForm().reset();
                                        Ext.getCmp('deliveryitemgrid').getStore().removeAll();
                                    }
                                }]
                        }
                        ]
                });
            w.show();
        }

        function editdelivery(btn){
            var sm = deliverygrid.getSelectionModel();
            if ( !sm.hasSelection() ) {
                Ext.Msg.show({
                        title: 'Warning',
                            buttons: Ext.MessageBox.OK,
                            msg: '選択行がありません！'
                            });
                return;
            }

            var sel = sm.getSelected();

            var productstore = new Ext.data.Store({
                    proxy: new Ext.data.HttpProxy({
                            url: '/product/listext/'
                        }),
                    reader: new Ext.data.JsonReader({
                            fields: ['code','full_name', 'display_name', 'category', 'categorycode', 'preview', 'price', 'depart'],
                            root: 'root',
                            totalProperty: 'total',
                            id: 'code'
                        },
                        [
            {name: 'code'},
            {name: 'full_name'},
            {name: 'display_name'},
            {name: 'category'},
            {name: 'categorycode'},
            {name: 'preview'},
            {name: 'price'},
            {name: 'depart'}
                         ]),
                    autoLoad: false
                });

            var w = new Ext.Window({
                    resizable: false,
                    modal: true,
                    layout: 'border',
                    width: 685,
                    height: 450,

                    items: [{
                            xtype: 'grid',
                            id: 'productgrid',
                            region: 'west',
                            frame: true,
                            title: '一覧',
                            tbar: {
                                xtype: 'toolbar',
                                id: 'producttoolbar',
                                width: 280,
                                items: [ {
                                        xtype: 'combo',
                                        id: 'catecmb',
                                        fieldLabel: 'カテゴリ',
                                        name: 'cate',
                                        store: categorystore,
                                        mode: 'local',
                                        displayField: 'display_name',
                                        valueField: 'code',
                                        hiddenName: 'category',
                                        allowBlank: true,
                                        editable: true,
                                        width: 100,
                                        forceSelection: true
                                    },'-',{
                                        text: '検索',
                                        handler: function(btn){
                                            productstore.reload({params:{category:Ext.getCmp('catecmb').getValue()}});
                                        }
                                    }
                                    ]
                            },
                            height: 450,
                            width: 280,
                            store: productstore,
                            columns: [
            {header: "表示名", width: 120, sortable: true, dataIndex: 'display_name'},
            {header: "カテゴリ", width: 120, sortable: true, dataIndex: 'category'}
                                      ],
                            sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
                            stripeRows: true,
                            listeners : {
                                cellclick : function( g, rowIndex, colIndex, e ) {
                                    var imgtt = new Ext.ToolTip({
                                            target: '',
                                            html: '<img src="/site_media/img/' + g.getStore().getAt( rowIndex ).get('preview') + '">',
                                            hideDelay: 1000
                                        });
                                    imgtt.showAt(e.getXY())
                                    window.setTimeout(function() {
                                            imgtt.hide()
                                                }, 1000);
                                }

                            }

                        },{
                            xtype: 'panel',
                            region: 'center',
                            frame: true,
                            layout: 'absolute',
                            width: 20,
                            anchor: '100%',
                            items: [{
                                    xtype: 'button',
                                    x: 0,
                                    y: 150,
                                    text: '追加',
                                    handler: function(){
                                        var sm = Ext.getCmp('productgrid').getSelectionModel();
                                        if ( !sm.hasSelection() ) {
                                            Ext.Msg.show({
                                                    title: 'Warning',
                                                        buttons: Ext.MessageBox.OK,
                                                        msg: '選択行がありません！'
                                                        });
                                            return;
                                        }
                                        var sel = sm.getSelected();

                                        if ( Ext.getCmp('deliveryitemgrid').getStore()
                                             .find('productcode',sel.data.code,0,false) != -1 ) {
                                            Ext.Msg.show({
                                                    title: 'Warning',
                                                        buttons: Ext.MessageBox.OK,
                                                        msg: '対象が既に追加済、個数のみ変更していい！'
                                                        });
                                            return;
                                        }

                                        var Product = Ext.getCmp('deliveryitemgrid').getStore().recordType;
                                        var p = new Product({
                                                productcode: sel.data.code,
                                                product: sel.data.display_name,
                                                price: sel.data.price,
                                                count: 0
                                            });
                                        Ext.getCmp('deliveryitemgrid').stopEditing();
                                        Ext.getCmp('deliveryitemgrid').getStore().add(p);
                                    }
                                }, {
                                    xtype: 'button',
                                    x: 0,
                                    y: 200,
                                    text: '削除',
                                    handler: function(){
                                        var sm = Ext.getCmp('deliveryitemgrid').getSelectionModel();
                                        if ( !sm.hasSelection() ) {
                                            Ext.Msg.show({
                                                    title: 'Warning',
                                                        buttons: Ext.MessageBox.OK,
                                                        msg: '選択行がありません！'
                                                        });
                                            return;
                                        }
                                        var sel = sm.getSelected();
                                        Ext.getCmp('deliveryitemgrid').getStore().remove(sel);
                                    }
                                }
                                ]
                        }, {
                            xtype: 'form',
                            id: 'updateform',
                            region: 'east',
                            labelWidth: 75,
                            url: '/delivery/updateext/',
                            frame: true,
                            title: 'デリバリー登録',
                            bodyStyle: 'padding:5px 5px 0',
                            width: 350,
                            defaultType: 'textfield',
                            method: 'POST',

                            items: [{
                                    xtype: 'label',
                                    text: sel.data.date + '(' + sel.data.branch + ')',
                                    cls: 'mylabel'
                                },{
                                    fieldLabel: '郵便料金',
                                    name: 'postfee',
                                    width: 200,
                                    value: sel.data.postfee,
                                    allowBlank:false
                                },{
                                    fieldLabel: '交通料金',
                                    name: 'transportfee',
                                    width: 200,
                                    value: sel.data.transportfee,
                                    allowBlank:false
                                },{
                                    fieldLabel: '郵便先',
                                    name: 'destination',
                                    width: 200,
                                    value: sel.data.destination,
                                    allowBlank:false
                                }, {
                                    xtype: 'editorgrid',
                                    id: 'deliveryitemgrid',
                                    store: new Ext.data.Store({
                                            proxy: new Ext.data.HttpProxy({
                                                    url: '/delivery/listitemsext/'
                                                }),
                                            baseParams: {
                                                date: sel.data.date,
                                                branch: sel.data.branch
                                            },
                                            reader: new Ext.data.JsonReader({
                                                    fields: ['productcode','product', 'price', 'count'],
                                                    root: 'root',
                                                    totalProperty: 'total'
                                                },
                                                [
            {name: 'productcode'},
            {name: 'product'},
            {name: 'price'},
            {name: 'count'}
                                                 ]
                                                ),
                                            autoLoad: true
                                        }),
                                    cm: new Ext.grid.ColumnModel([{
                                                id: 'productcolumn',
                                                header: '商品名',
                                                dataIndex: 'product',
                                                width: 160,
                                                editable: false,
                                                // use shorthand alias defined above
                                                editor: new Ext.form.TextField({
                                                        allowBlank: false
                                                    })
                                            },{
                                                header: '単価',
                                                dataIndex: 'price',
                                                width: 70,
                                                editor: new Ext.form.NumberField({
                                                        value: 0
                                                    })
                                            },{
                                                header: '個数',
                                                dataIndex: 'count',
                                                width: 70,
                                                editor: new Ext.form.NumberField({
                                                        value: 0
                                                    })
                                            }
                                            ]),
                                    width: 320,
                                    height: 300,
                                    title: 'アイテム',
                                    frame: true,
                                    sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
                                    clicksToEdit: 1
                                }
                                ],

                            buttons: [{
                                    text: '更新',
                                    handler: function(){
                                        if (Ext.getCmp('deliveryitemgrid').getStore().getCount() == 0 ) {
                                            Ext.Msg.show({
                                                    title: '件数確認',
                                                    buttons: Ext.MessageBox.OK,
                                                    msg: 'デリバリー件数がゼロ!'
                                                });
                                            return;
                                        }
                                        Ext.Msg.show({
                                                title: '更新確認',
                                                buttons: Ext.MessageBox.YESNO,
                                                msg: 'よろしいですか',
                                                fn: function(btn){
                                                    if ( btn == 'yes' ) {
                                                        var count = Ext.getCmp('deliveryitemgrid').getStore().getCount();
                                                        var i = 0;
                                                        var items = "";
                                                        for( i = 0; i < count; i++ ) {
                                                            p = Ext.getCmp('deliveryitemgrid').getStore().getAt(i);
                                                            items = items + p.data.productcode + "," + p.data.price + "," + p.data.count + ",";
                                                        }
                                                        Ext.getCmp('updateform').getForm().submit({
                                                                //waitMsg: 'アップロード...',
                                                                params: { items: items,
                                                                          date: sel.data.date,
                                                                          branch: sel.data.branch },
                                                                success: function(f,a){
                                                                    Ext.Msg.alert('Success', '更新成功');
                                                                    listdeliverybydate(null);
                                                                    w.close();
                                                                },
                                                                failure: function(f,a){
                                                                    Ext.Msg.alert('Warning', 'Error');
                                                                }
                                                            })
                                                    }
                                                }
                                            });
                                    }
                                },{
                                    text: 'リセット',
                                    handler: function() {
                                        Ext.getCmp('updateform').getForm().reset();
                                        Ext.getCmp('deliveryitemgrid').getStore().reload();
                                    }
                                }]
                        }
                        ]
                });
            w.show();
        }

        function deldelivery(btn){
            var sm = deliverygrid.getSelectionModel();
            if ( sm.hasSelection() ) {
                var sel = sm.getSelected();

                Ext.Msg.show({
                        title: '削除確認',
                            buttons: Ext.MessageBox.YESNO,
                            msg: 'よろしいですか',
                            fn: function(btn){
                            if ( btn == 'yes' ) {
                                Ext.Ajax.request({
                                        url: '/delivery/deleteext/',
                                            success: function(r, o) {
                                            Ext.Msg.alert('Success', '削除成功');
                                            listdeliverybydate(null);
                                            //}
                                        },
                                            failure: function(r, o){
                                            //obj = Ext.util.JSON.decode(r.responseText);
                                            Ext.Msg.alert('Failure!', '削除失敗');
                                        },
                                            headers: {
                                            'my-header': 'deldelivery'
                                                },
                                            params: { date: sel.data.date,
                                                branch: sel.data.branch }
                                    });
                            }
                        }
                    });

            } else {
                Ext.Msg.show({
                        title: 'Warning',
                            buttons: Ext.MessageBox.OK,
                            msg: '選択行がありません！'
                            });
            }
        }

        function csvoutput(btn){
            var sm = deliverygrid.getSelectionModel();
            if ( sm.hasSelection() ) {
                var sel = sm.getSelected();

                Ext.Msg.show({
                        title: 'CSV出力確認',
                            buttons: Ext.MessageBox.YESNO,
                            msg: 'よろしいですか',
                            fn: function(btn){
                            if ( btn == 'yes' ) {
                                Ext.Ajax.request({
                                        url: '/delivery/csvoutputext/',
                                            success: function(r, o) {
                                            obj = Ext.util.JSON.decode(r.responseText);
                                            //Ext.Msg.alert('Success', '成功');
                                            try {
                                                Ext.destroy(Ext.get('downloadIframe'));
                                            }
                                            catch(e) {}
                                            Ext.DomHelper.append(document.body, {
                                                    tag: 'iframe',
                                                        id:'downloadIframe',
                                                        frameBorder: 0,
                                                        width: 0,
                                                        height: 0,
                                                        css: 'display:none;visibility:hidden;height:0px;',
                                                        src: '/site_media' + obj.filename
                                                        });
                                        },
                                            failure: function(r, o){
                                            Ext.Msg.alert('Failure!', 'CSV出力失敗');
                                        },
                                            headers: {
                                            'my-header': 'csvoutput'
                                                },
                                            params: { date: sel.data.date,
                                                branch: sel.data.branch }
                                    });
                            }
                        }
                    });

            } else {
                Ext.Msg.show({
                        title: 'Warning',
                            buttons: Ext.MessageBox.OK,
                            msg: '選択行がありません！'
                            });
            }

        }
    });
