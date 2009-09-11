Ext.onReady(function(){

        Ext.QuickTips.init();

        // turn on validation errors beside the field globally
        Ext.form.Field.prototype.msgTarget = 'side';

        var ds = new Ext.data.Store({
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

        var departstore = new Ext.data.Store({
                proxy: new Ext.data.HttpProxy({
                        url: '/depart/listext/'
                    }),
                reader: new Ext.data.JsonReader({
                        fields: ['code','full_name', 'display_name', 'station_code', 'station'],
                        root: 'root',
                        totalProperty: 'total',
                        id: 'code'
                    },
                    [
        {name: 'code'},
        {name: 'full_name'},
        {name: 'display_name'},
        {name: 'station_code'},
        {name: 'station'}
                     ]),
                autoLoad: false
            });

        var bd = Ext.getBody();

        /*
         * ================  Simple form  =======================
         */

        var departgrid = new Ext.grid.GridPanel({
                frame: true,
                title: '一覧',
                tbar: {
                    xtype: 'toolbar',
                    id: 'toolbar',
                    width: 500,
                    items: [{
                            xtype: 'combo',
                            id: 'stcmb',
                            fieldLabel: 'タイプ',
                            name: 'station_type',
                            store: ds,
                            mode: 'local',
                            displayField: 'display_name',
                            valueField: 'code',
                            hiddenName: 'stationtype',
                            allowBlank: true,
                            editable: true,
                            forceSelection: true
                        },'-',{
                            text: '検索',
                            handler: listdepartbystationtype
                        },'->',{
                            text: '登録',
                            handler: adddepart
                        },{
                            text: '編集',
                            handler: editdepart
                        },{
                            text: '削除',
                            handler: deldepart
                        }
                        ]
                },
                height: 400,
                width: 500,
                store: departstore,
                columns: [
        {header: "和名", width: 200, sortable: true, dataIndex: 'full_name'},
        {header: "表示名", width: 120, sortable: true, dataIndex: 'display_name'},
        {header: "最寄駅", width: 120, sortable: true, dataIndex: 'station'}
                          ],
                sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
                stripeRows: true
            });
        departgrid.render(document.body);


        function listdepartbystationtype(btn){
            departgrid.getStore().reload({params:{station_type:getstationtypecode()}});
        }

        function adddepart(btn){
            var stationstore = new Ext.data.Store({
                    proxy: new Ext.data.HttpProxy({
                            url: '/station/listext/'
                        }),
                    reader: new Ext.data.JsonReader({
                            fields: ['code','full_name', 'display_name', 'station_type'],
                            root: 'root',
                            totalProperty: 'total',
                            id: 'code'
                        },
                        [
            {name: 'code'},
            {name: 'full_name'},
            {name: 'display_name'},
            {name: 'station_type'}
                         ]),
                    autoLoad: false
                });

            var w = new Ext.Window({
                    resizable: false,
                    modal: true,
                    items: [{
                            xtype: 'form',
                            id: 'addform',
                            labelWidth: 75,
                            url: '/depart/addext/',
                            frame: true,
                            title: 'デパート登録',
                            bodyStyle: 'padding:5px 5px 0',
                            width: 450,
                            defaultType: 'textfield',
                            method: 'POST',

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
                                    id: 'station',
                                    name: 'station',
                                    width: 315,
                                    allowBlank:true,
                                    hidden: true
                                },{
                                    xtype: 'grid',
                                    id: 'substationgrid',
                                    frame: false,
                                    title: '駅選択',
                                    tbar: {
                                        xtype: 'toolbar',
                                        id: 'subtoolbar',
                                        width: 300,
                                        items: [{
                                                xtype: 'combo',
                                                id: 'substcmb',
                                                fieldLabel: 'タイプ',
                                                name: 'station_type',
                                                store: ds,
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
                                                handler: liststationbytype
                                            }
                                            ]
                                    },
                                    height: 200,
                                    width: 400,
                                    store: stationstore,
                                    columns: [
            {header: "和名", width: 120, sortable: false, dataIndex: 'full_name'},
            {header: "表示名", width: 120, sortable: false, dataIndex: 'display_name'},
            {header: "タイプ", width: 120, sortable: true, dataIndex: 'station_type'}
                                              ],
                                    sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
                                    stripeRows: false,
                                    listeners: {
                                        cellclick : function(grid, rowIndex, colIndex, obj) {
                                            Ext.getCmp('station').setValue(grid.getStore().getAt( rowIndex ).get('code'));
                                        }
                                    }
                                }
                                ],

                            buttons: [{
                                    text: '登録',
                                    handler: function(){
                                        var sm = Ext.getCmp('substationgrid').getSelectionModel();
                                        if ( sm.hasSelection() ) {
                                            var sel = sm.getSelected();
                                            Ext.Msg.show({
                                                    title: '登録確認',
                                                        buttons: Ext.MessageBox.YESNO,
                                                        msg: 'よろしいですか',
                                                        fn: function(btn){
                                                        if ( btn == 'yes' ) {
                                                            Ext.getCmp('addform').getForm().submit({
                                                                    success: function(f,a){
                                                                        Ext.Msg.alert('Success', '登録成功');
                                                                        departgrid.getStore().reload({
                                                                                params:{station_type:getstationtypecode()}});
                                                                        w.close();
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
                                        Ext.getCmp('substationgrid').getStore().removeAll();
                                        Ext.getCmp('addform').getForm().reset();
                                    }
                                }]
                        }
                        ]
                });
            w.show();
        }

        function editdepart(btn){
            var sm = departgrid.getSelectionModel();
            if ( !sm.hasSelection() ) {
                Ext.Msg.show({
                        title: 'Warning',
                            buttons: Ext.MessageBox.OK,
                            msg: '選択行がありません！'
                            });
                return;
            }
            var sel = sm.getSelected();

            var stationstore = new Ext.data.Store({
                    proxy: new Ext.data.HttpProxy({
                            url: '/station/listext/'
                        }),
                    reader: new Ext.data.JsonReader({
                            fields: ['code','full_name', 'display_name', 'station_type'],
                            root: 'root',
                            totalProperty: 'total',
                            id: 'code'
                        },
                        [
            {name: 'code'},
            {name: 'full_name'},
            {name: 'display_name'},
            {name: 'station_type'}
                         ]),
                    autoLoad: false
                });

            var w = new Ext.Window({
                    resizable: false,
                    modal: true,
                    items: [{
                            xtype: 'form',
                            id: 'updateform',
                            labelWidth: 75,
                            url: '/depart/updateext/',
                            frame: true,
                            title: 'デパート登録',
                            bodyStyle: 'padding:5px 5px 0',
                            width: 450,
                            defaultType: 'textfield',
                            method: 'POST',

                            items: [{
                                    id: 'code',
                                    name: 'code',
                                    width: 315,
                                    value: sel.data.code,
                                    allowBlank:true,
                                    hidden: true
                                },{
                                    id: 'station',
                                    name: 'station',
                                    width: 315,
                                    value: sel.data.station_code,
                                    allowBlank:true,
                                    hidden: true
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
                                    xtype: 'grid',
                                    id: 'substationgrid',
                                    frame: false,
                                    title: '駅選択',
                                    tbar: {
                                        xtype: 'toolbar',
                                        id: 'subtoolbar',
                                        width: 300,
                                        items: [{
                                                xtype: 'combo',
                                                id: 'substcmb',
                                                fieldLabel: 'タイプ',
                                                name: 'station_type',
                                                store: ds,
                                                mode: 'local',
                                                displayField: 'display_name',
                                                valueField: 'code',
                                                hiddenName: 'stationtype',
                                                allowBlank: true,
                                                editable: true,
                                                forceSelection: true
                                            },'-',{
                                                text: '検索',
                                                handler: liststationbytype
                                            },
                                            '->',{
                                                text: 'クリア',
                                                handler: function() {
                                                    Ext.getCmp('substationgrid').getStore().removeAll();
                                                    Ext.getCmp('station').reset();
                                                }
                                            }]
                                    },
                                    height: 200,
                                    width: 400,
                                    store: stationstore,
                                    columns: [
            {header: "和名", width: 120, sortable: false, dataIndex: 'full_name'},
            {header: "表示名", width: 120, sortable: false, dataIndex: 'display_name'},
            {header: "タイプ", width: 120, sortable: true, dataIndex: 'station_type'}
                                              ],
                                    sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
                                    stripeRows: false,
                                    listeners: {
                                        cellclick : function(grid, rowIndex, colIndex, obj) {
                                            Ext.getCmp('station').setValue(grid.getStore().getAt( rowIndex ).get('code'));
                                        }
                                    }
                                }
                                ],

                            buttons: [{
                                    text: '更新',
                                    handler: function(){
                                        var sm = Ext.getCmp('substationgrid').getSelectionModel();
                                        var msg = '';
                                        if ( sm.hasSelection() ) {
                                            Ext.getCmp('station').setValue(sm.getSelected().data.code);
                                        } else {
                                            msg = '駅変更せず,';
                                            Ext.getCmp('station').reset();
                                        }

                                        Ext.Msg.show({
                                                title: '更新確認',
                                                buttons: Ext.MessageBox.YESNO,
                                                msg: msg + 'よろしいですか',
                                                fn: function(btn){
                                                    if ( btn == 'yes' ) {
                                                        Ext.getCmp('updateform').getForm().submit({
                                                                success: function(f,a){
                                                                    Ext.Msg.alert('Success', '更新成功');
                                                                    departgrid.getStore().reload({
                                                                            params:{station_type:getstationtypecode()}});
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
                                    text: 'キャンセル',
                                    handler: function() {
                                        w.close();
                                    }
                                }]
                        }
                        ]
                });
            w.show();

        }

        function deldepart(btn){
            var sm = departgrid.getSelectionModel();
            if ( sm.hasSelection() ) {
                var sel = sm.getSelected();

                Ext.Msg.show({
                        title: '削除確認',
                            buttons: Ext.MessageBox.YESNO,
                            msg: 'よろしいですか',
                            fn: function(btn){
                            if ( btn == 'yes' ) {
                                Ext.Ajax.request({
                                        url: '/depart/deleteext/',
                                            success: function(r, o) {
                                            obj = Ext.util.JSON.decode(r.responseText);
                                            if ( obj.errors != '' ) {
                                                Ext.Msg.alert('Failure!', '該当デパートが参照されるので、削除出来ず');
                                            } else {
                                                Ext.Msg.alert('Success', '削除成功');
                                                departgrid.getStore().reload({
                                                        params:{station_type:getstationtypecode()}});
                                            }
                                        },
                                            failure: function(r, o){
                                            obj = Ext.util.JSON.decode(r.responseText);
                                            Ext.Msg.alert('Failure!', obj.errors.reason);
                                        },
                                            headers: {
                                            'my-header': 'deldepart'
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

        function getstationtypecode(){
            return Ext.getCmp('stcmb').getValue();
        }

        function liststationbytype(btn){
            Ext.getCmp('substationgrid').getStore().reload({params:{station_type:Ext.getCmp('substcmb').getValue()}});
        }

    });
