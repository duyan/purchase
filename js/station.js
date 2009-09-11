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

        var stationstore = new Ext.data.Store({
                proxy: new Ext.data.HttpProxy({
                        url: '/station/listext/'
                    }),
                reader: new Ext.data.JsonReader({
                        fields: ['code','full_name', 'display_name', 'station_type', 'stationtypecode'],
                        root: 'root',
                        totalProperty: 'total',
                        id: 'code'
                    },
                    [
        {name: 'code'},
        {name: 'full_name'},
        {name: 'display_name'},
        {name: 'station_type'},
        {name: 'stationtypecode'}
                     ]),
                autoLoad: false
            });

        var bd = Ext.getBody();

        /*
         * ================  Simple form  =======================
         */

        var stationgrid = new Ext.grid.GridPanel({
                frame: true,
                title: '一覧',
                tbar: {
                    xtype: 'toolbar',
                    id: 'toolbar',
                    width: 500,
                    items: [ {
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
                            handler: liststationbytype
                        },'->',{
                            text: '登録',
                            handler: addstation
                        },{
                            text: '編集',
                            handler: editstation
                        },{
                            text: '削除',
                            handler: delstation
                        }
                        ]
                },
                height: 400,
                width: 500,
                store: stationstore,
                columns: [
        {header: "和名", width: 200, sortable: true, dataIndex: 'full_name'},
        {header: "表示名", width: 120, sortable: true, dataIndex: 'display_name'},
        {header: "タイプ", width: 120, sortable: true, dataIndex: 'station_type'}
                          ],
                sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
                stripeRows: true
            });
        stationgrid.render(document.body);

        function liststationbytype(btn){
            stationgrid.getStore().reload({params:{station_type:getstationtypecode()}});
        }

        function addstation(btn){
            var w = new Ext.Window({
                    resizable: false,
                    modal: true,
                    items: [{
                            xtype: 'form',
                            id: 'addform',
                            labelWidth: 75,
                            url: '/station/addext/',
                            frame: true,
                            title: '駅登録',
                            bodyStyle: 'padding:5px 5px 0',
                            width: 350,
                            defaults: {width: 230},
                            defaultType: 'textfield',
                            method: 'POST',

                            items: [{
                                    fieldLabel: '和名',
                                    name: 'full_name',
                                    allowBlank:false
                                },{
                                    fieldLabel: '表示名',
                                    name: 'display_name',
                                    allowBlank:false
                                },{
                                    xtype: 'combo',
                                    fieldLabel: 'タイプ',
                                    name: 'add_station_type',
                                    store: ds,
                                    mode: 'local',
                                    displayField: 'display_name',
                                    valueField: 'code',
                                    hiddenName: 'stationtype',
                                    allowBlank:false,
                                    editable:true,
                                    forceSelection: true
                                }],

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
                                                                success: function(f,a){
                                                                    Ext.Msg.alert('Success', '登録成功');
                                                                    stationgrid.getStore().reload({
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
                                    text: 'リセット',
                                    handler: function() {
                                        Ext.getCmp('addform').getForm().reset();
                                    }
                                }]
                        }
                        ]
                });
            w.show();
        }

        function editstation(btn){
            var sm = stationgrid.getSelectionModel();
            if ( sm.hasSelection() ) {
                var sel = sm.getSelected();
                var w = new Ext.Window({
                        resizable: false,
                        modal: true,
                        items: [{
                                xtype: 'form',
                                id: 'updateform',
                                labelWidth: 75, // label settings here cascade unless overridden
                                url:'/station/updateext/',
                                frame: true,
                                title: '駅編集',
                                bodyStyle:'padding:5px 5px 0',
                                width: 350,
                                defaults: {width: 230},
                                defaultType: 'textfield',
                                method: 'POST',

                                items: [{
                                        name: 'code',
                                        value: sel.data.code,
                                        hidden: true
                                    },{
                                        fieldLabel: '和名',
                                        name: 'full_name',
                                        value: sel.data.full_name,
                                        allowBlank:false
                                    },{
                                        fieldLabel: '表示名',
                                        name: 'display_name',
                                        value: sel.data.display_name,
                                        allowBlank:false
                                    },{
                                        xtype: 'combo',
                                        fieldLabel: 'タイプ',
                                        name: 'updatestatintype',
                                        store: ds,
                                        mode: 'local',
                                        displayField: 'display_name',
                                        valueField: 'code',
                                        hiddenName: 'stationtype',
                                        allowBlank: false,
                                        editable: true,
                                        value: sel.data.stationtypecode,
                                        forceSelection: true
                                    }],
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
                                                                    success: function(f,a){
                                                                        Ext.Msg.alert('Success', '更新成功');
                                                                        stationgrid.getStore().reload({
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
            } else {
                Ext.Msg.show({
                        title: 'Warning',
                            buttons: Ext.MessageBox.OK,
                            msg: '選択行がありません！'
                            });
            }
        }

        function delstation(btn){
            var sm = stationgrid.getSelectionModel();
            if ( sm.hasSelection() ) {
                var sel = sm.getSelected();

                Ext.Msg.show({
                        title: '削除確認',
                            buttons: Ext.MessageBox.YESNO,
                            msg: 'よろしいですか',
                            fn: function(btn){
                            if ( btn == 'yes' ) {
                                Ext.Ajax.request({
                                        url: '/station/deleteext/',
                                            success: function(r, o) {
                                            obj = Ext.util.JSON.decode(r.responseText);
                                            if ( obj.errors.reason != '' ) {
                                                Ext.Msg.alert('Failure!', '該当駅が参照されるので、削除出来ず');
                                            } else {
                                                Ext.Msg.alert('Success', '削除成功');
                                                stationgrid.getStore().reload({
                                                        params:{station_type:getstationtypecode()}});
                                            }
                                        },
                                            failure: function(r, o){
                                            obj = Ext.util.JSON.decode(r.responseText);
                                            Ext.Msg.alert('Failure!', obj.errors.reason);
                                        },
                                            headers: {
                                            'my-header': 'foo'
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
    });
