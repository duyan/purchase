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

        var stationtypestore = new Ext.data.Store({
                proxy: new Ext.data.HttpProxy({
                        url: '/param/liststationtype/'
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

        var pricestore = new Ext.data.Store({
                proxy: new Ext.data.HttpProxy({
                        url: '/product/listpriceext/'
                    }),
                reader: new Ext.data.JsonReader({
                        fields: ['depart','discount_price', 'regular_price','departcode'],
                        root: 'root',
                        totalProperty: 'total'
                    },
                    [
        {name: 'depart'},
        {name: 'discount_price'},
        {name: 'regular_price'},
        {name: 'departcode'}
                     ]),
                autoLoad: false
            });

        var productstore = new Ext.data.Store({
                proxy: new Ext.data.HttpProxy({
                        url: '/product/listext/'
                    }),
                reader: new Ext.data.JsonReader({
                        fields: ['code','full_name', 'display_name', 'category', 'categorycode', 'preview'],
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
        {name: 'preview'}
                     ]),
                autoLoad: false
            });

        var bd = Ext.getBody();

        /*
         * ================  Simple form  =======================
         */

        var productgrid = new Ext.grid.GridPanel({
                id: 'productgrid',
                frame: true,
                title: '一覧',
                tbar: {
                    xtype: 'toolbar',
                    id: 'toolbar',
                    width: 500,
                    items: [{
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
                            forceSelection: true
                        },'-',{
                            text: '検索',
                            handler: listproductbycategory
                        },
                        '->',{
                            text: '登録',
                            handler: addproduct
                        },{
                            text: '価格',
                            handler: handleprice
                        },{
                            text: '編集',
                            handler: editproduct
                        },{
                            text: '削除',
                            handler: delproduct
                        }
                        ]
                },
                height: 400,
                width: 500,
                store: productstore,
                columns: [
        {header: "和名", width: 200, sortable: true, dataIndex: 'full_name'},
        {header: "表示名", width: 120, sortable: true, dataIndex: 'display_name'},
        {header: "カテゴリ", width: 120, sortable: true, dataIndex: 'category'}
                          ],
                sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
                stripeRows: true,
                listeners: {
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
            });
        productgrid.render(document.body);

        function listproductbycategory(btn){
            productgrid.getStore().reload({params:{category:getcategoryvalue()}});
        }
        function getcategoryvalue(){
            return Ext.getCmp('catecmb').getValue();
        }

        function addproduct(btn){
            var w = new Ext.Window({
                    resizable: false,
                    modal: true,
                    items: [{
                            xtype: 'form',
                            id: 'addform',
                            fileUpload: true,
                            labelWidth: 75,
                            url: '/product/addext/',
                            frame: true,
                            title: '商品登録',
                            bodyStyle: 'padding:5px 5px 0',
                            width: 450,
                            defaultType: 'textfield',
                            method: 'POST',
                            defaults: {
                                anchor: '90%'
                            },

                            items: [{
                                    fieldLabel: '和名',
                                    name: 'full_name',
                                    width: 315,
                                    allowBlank:false
                                },{
                                    fieldLabel: '表示名',
                                    name: 'display_name',
                                    width: 315,
                                    allowBlank:false
                                },{
                                    xtype: 'combo',
                                    fieldLabel: 'カテゴリ',
                                    name: 'subcate',
                                    store: categorystore,
                                    mode: 'local',
                                    displayField: 'display_name',
                                    valueField: 'code',
                                    hiddenName: 'category',
                                    allowBlank:false,
                                    editable:true,
                                    forceSelection: true
                                }, {
                                    xtype: 'fileuploadfield',
                                    id: 'form-file',
                                    emptyText: '写真選択',
                                    fieldLabel: '写真',
                                    name: 'photo-path',
                                    allowBlank: false,
                                    buttonText: '',
                                    buttonCfg: {
                                        iconCls: 'upload-icon'
                                    }
                                }
                                ],

                            buttons: [{
                                    text: '登録',
                                    handler: function(){
                                        Ext.Msg.show({
                                                title: '登録確認',
                                                buttons: Ext.MessageBox.YESNO,
                                                msg: 'よろしいですか',
                                                fn: function(btn){
                                                    if ( btn == 'yes' ) {
                                                        Ext.getCmp('addform').getForm().submit({
                                                                waitMsg: 'アップロード...',
                                                                success: function(f,a){
                                                                    Ext.Msg.alert('Success', '登録成功');
                                                                    productgrid.getStore().reload({
                                                                            params:{category:getcategoryvalue()}});
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
                                    }
                                }]
                        }]
                });
            w.show();
        }

        function handleprice(btn){
            var sm = productgrid.getSelectionModel();
            if ( !sm.hasSelection() ) {
                Ext.Msg.show({
                        title: 'Warning',
                            buttons: Ext.MessageBox.OK,
                            msg: '選択行がありません！'
                            });
                return;
            }
            var sel = sm.getSelected();

            var w = new Ext.Window({
                    resizable: false,
                    modal: true,
                    // labelWidth: 75,
                    items: [{
                            xtype: 'textfield',
                            name: 'productcode',
                            value: sel.data.code,
                            hidden: true
                        },{
                            xtype: 'label',
                            text: '商品⇒',
                            width: 200,
                            cls: 'mylabel'
                        },{
                            xtype: 'label',
                            name: 'productname',
                            text: sel.data.display_name,
                            cls: 'mylabel'
                        },{
                            xtype: 'grid',
                            id: 'pricegrid',
                            frame: false,
                            title: 'プライス一覧',
                            tbar: {
                                xtype: 'toolbar',
                                id: 'pricetoolbar',
                                width: 500,
                                items: [
                                        '->',{
                                            text: '登録',
                                            handler: function(){
                                                addprice(sel.data.code);
                                                pricestore.reload({params:{productcode:sel.data.code}});
                                            }
                                        },{
                                            text: '削除',
                                            handler: function(){
                                                delprice(sel.data.code);
                                                pricestore.reload({params:{productcode:sel.data.code}});
                                            }
                                        }
                                        ]
                            },
                            height: 400,
                            width: 500,
                            store: pricestore,
                            columns: [
            {header: "デパート", width: 150, sortable: false, dataIndex: 'depart'},
            {header: "ディスカウントプライス", width: 150, sortable: true, dataIndex: 'discount_price'},
            {header: "レギュラープライス", width: 150, sortable: true, dataIndex: 'regular_price'}
                                      ],
                            sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
                            stripeRows: true,
                        }],
                });
            pricestore.reload({params:{productcode:sel.data.code}});
            w.show();
        }

        function addprice(productcode) {

            var departstore = new Ext.data.Store({
                    proxy: new Ext.data.HttpProxy({
                            url: '/depart/listext/'
                        }),
                    reader: new Ext.data.JsonReader({
                            fields: ['code','full_name', 'display_name', 'station'],
                            root: 'root',
                            totalProperty: 'total',
                            id: 'code'
                        },
                        [
            {name: 'code'},
            {name: 'full_name'},
            {name: 'display_name'},
            {name: 'station'}
                         ]),
                    autoLoad: false
                });


            var w = new Ext.Window({
                    resizable: false,
                    modal: true,
                    items: [{
                            xtype: 'form',
                            id: 'addprice',
                            labelWidth: 125,
                            url: '/product/addpriceext/',
                            frame: true,
                            title: 'プライス登録',
                            bodyStyle: 'padding:5px 5px 0',
                            width: 520,
                            defaultType: 'textfield',
                            method: 'POST',

                            items: [{
                                    name: 'productcode',
                                    width: 315,
                                    value: productcode,
                                    hidden: true,
                                    allowBlank:false
                                },{
                                    xtype: 'numberfield',
                                    fieldLabel: 'ディスカウントプライス',
                                    name: 'discountprice',
                                    width: 315,
                                    allowBlank:false
                                },{
                                    xtype: 'numberfield',
                                    fieldLabel: 'レギュラープライス',
                                    name: 'regularprice',
                                    width: 315,
                                    allowBlank:false
                                },{
                                    id: 'departcode',
                                    name: 'departcode',
                                    width: 315,
                                    hidden: true,
                                    allowBlank:false
                                },{
                                    xtype: 'grid',
                                    id: 'departgrid',
                                    frame: true,
                                    title: 'デパート一覧',
                                    tbar: {
                                        xtype: 'toolbar',
                                        id: 'stationtypetoolbar',
                                        width: 500,
                                        items: [{
                                                xtype: 'combo',
                                                id: 'substcmb',
                                                fieldLabel: 'タイプ',
                                                name: 'station_type',
                                                store: stationtypestore,
                                                mode: 'local',
                                                displayField: 'display_name',
                                                valueField: 'code',
                                                hiddenName: 'stationtype',
                                                allowBlank: true,
                                                editable: true,
                                                forceSelection: true
                                            },
                                            '-',{
                                                text: '検索',
                                                handler: function(){
                                                    departstore.reload({params:{station_type:Ext.getCmp('substcmb').getValue()}});
                                                }
                                            }
                                            ]
                                    },
                                    height: 200,
                                    width: 500,
                                    store: departstore,
                                    columns: [
            {header: "和名", width: 200, sortable: true, dataIndex: 'full_name'},
            {header: "表示名", width: 120, sortable: true, dataIndex: 'display_name'},
            {header: "駅", width: 120, sortable: true, dataIndex: 'station'}
                                              ],
                                    sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
                                    stripeRows: true,
                                    listeners: {
                                        cellclick : function(grid, rowIndex, colIndex, obj) {
                                            Ext.getCmp('departcode').setValue(grid.getStore().getAt( rowIndex ).get('code'));
                                        }
                                    }
                                }
                                ],

                            buttons: [{
                                    text: '登録',
                                    handler: function(){
                                        var sm = Ext.getCmp('departgrid').getSelectionModel();
                                        if ( sm.hasSelection() ) {
                                            var sel = sm.getSelected();
                                            Ext.Msg.show({
                                                    title: '登録確認',
                                                        buttons: Ext.MessageBox.YESNO,
                                                        msg: 'よろしいですか',
                                                        fn: function(btn){
                                                        if ( btn == 'yes' ) {
                                                            Ext.getCmp('addprice').getForm().submit({
                                                                    success: function(f,a){

                                                                        if ( a.result.errors != '' ) {
                                                                            //Ext.Msg.alert('F',obj.errors.reason);
                                                                            Ext.Msg.alert('Failure!', 'プライスが既に登録されるので、上書き出来ず');
                                                                        } else {
                                                                            Ext.Msg.alert('Success', '登録成功');
                                                                            Ext.getCmp('pricegrid').getStore().reload({
                                                                                    params:{productcode:productcode}});
                                                                            w.close();
                                                                        }

                                                                    },
                                                                        failure: function(f,a){
                                                                        Ext.Msg.alert('Warning', 'Error');
                                                                    }
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
                                },{
                                    text: 'リセット',
                                    handler: function() {
                                        Ext.getCmp('departgrid').getStore().removeAll();
                                        Ext.getCmp('addprice').getForm().reset();
                                    }
                                }]
                        }
                        ]
                });
            w.show();

        }

        function delprice(productcode) {
            var sm = Ext.getCmp('pricegrid').getSelectionModel();
            if ( sm.hasSelection() ) {
                var sel = sm.getSelected();

                Ext.Msg.show({
                        title: '削除確認',
                            buttons: Ext.MessageBox.YESNO,
                            msg: 'よろしいですか',
                            fn: function(btn){
                            if ( btn == 'yes' ) {
                                Ext.Ajax.request({
                                        url: '/product/delpriceext/',
                                            success: function(r, o) {
                                            Ext.Msg.alert('Success', '削除成功');
                                            Ext.getCmp('pricegrid').getStore().reload({
                                                    params:{productcode:productcode}});
                                        },
                                            failure: function(r, o){
                                            Ext.Msg.alert('Failure!', '削除失敗');
                                        },
                                            headers: {
                                            'my-header': 'delprice'
                                                },
                                            params: { productcode: productcode,
                                                departcode: sel.data.departcode }
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

        function editproduct(btn){
            var sm = productgrid.getSelectionModel();
            if ( !sm.hasSelection() ) {
                Ext.Msg.show({
                        title: 'Warning',
                            buttons: Ext.MessageBox.OK,
                            msg: '選択行がありません！'
                            });
                return;
            }
            var sel = sm.getSelected();

            var w = new Ext.Window({
                    resizable: false,
                    modal: true,
                    items: [{
                            xtype: 'form',
                            id: 'updateform',
                            fileUpload: true,
                            labelWidth: 75,
                            url: '/product/updateext/',
                            frame: true,
                            title: '商品登録',
                            bodyStyle: 'padding:5px 5px 0',
                            width: 450,
                            defaultType: 'textfield',
                            method: 'POST',
                            defaults: {
                                anchor: '90%'
                            },

                            items: [{
                                    name: 'code',
                                    width: 315,
                                    value: sel.data.code,
                                    hidden: true,
                                    allowBlank:false
                                },{
                                    fieldLabel: '和名',
                                    name: 'full_name',
                                    width: 315,
                                    value: sel.data.full_name,
                                    allowBlank:false
                                },{
                                    fieldLabel: '表示名',
                                    name: 'display_name',
                                    width: 315,
                                    value: sel.data.display_name,
                                    allowBlank:false
                                },{
                                    xtype: 'combo',
                                    fieldLabel: 'カテゴリ',
                                    name: 'subcate',
                                    store: categorystore,
                                    mode: 'local',
                                    displayField: 'display_name',
                                    valueField: 'code',
                                    hiddenName: 'category',
                                    allowBlank:false,
                                    editable:true,
                                    value: sel.data.categorycode,
                                    forceSelection: true
                                },{
                                    xtype: 'label',
                                    text: '元写真⇒',
                                    cls: 'mylabel'
                                },{
                                    xtype: 'label',
                                    html: '<img src="/site_media/img/' + sel.data.preview + '">'
                                },{
                                    xtype: 'fileuploadfield',
                                    id: 'form-file',
                                    emptyText: '写真選択',
                                    fieldLabel: '写真',
                                    name: 'photo-path',
                                    allowBlank: true,
                                    buttonText: '',
                                    buttonCfg: {
                                        iconCls: 'upload-icon'
                                    }
                                }
                                ],

                            buttons: [{
                                    text: '更新',
                                    handler: function(){
                                        Ext.Msg.show({
                                                title: '更新確認',
                                                buttons: Ext.MessageBox.YESNO,
                                                msg: 'よろしいですか',
                                                fn: function(btn){
                                                    if ( btn == 'yes' ) {
                                                        Ext.getCmp('updateform').getForm().submit({
                                                                waitMsg: 'アップロード...',
                                                                success: function(f,a){
                                                                    Ext.Msg.alert('Success', '更新成功');
                                                                    productgrid.getStore().reload({
                                                                            params:{category:getcategoryvalue()}});
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
                                    }
                                }]
                        }
                        ]
                });
            w.show();

        }

        function delproduct(btn){
            var sm = productgrid.getSelectionModel();
            if ( sm.hasSelection() ) {
                var sel = sm.getSelected();

                Ext.Msg.show({
                        title: '削除確認',
                            buttons: Ext.MessageBox.YESNO,
                            msg: 'よろしいですか',
                            fn: function(btn){
                            if ( btn == 'yes' ) {
                                Ext.Ajax.request({
                                        url: '/product/deleteext/',
                                            success: function(r, o) {
                                            obj = Ext.util.JSON.decode(r.responseText);
                                            if ( obj.errors != '' ) {
                                                Ext.Msg.alert('Failure!', '該当商品が参照されるので、削除出来ず');
                                            } else {
                                                Ext.Msg.alert('Success', '削除成功');
                                                productgrid.getStore().reload({
                                                        params:{category:getcategoryvalue()}});
                                            }
                                        },
                                            failure: function(r, o){
                                            Ext.Msg.alert('Failure!', '削除失敗');
                                        },
                                            headers: {
                                            'my-header': 'delproduct'
                                                },
                                            params: { code: sel.data.code }
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
