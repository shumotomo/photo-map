var normalm = L.tileLayer.chinaProvider('GaoDe.Normal.Map', {
    maxZoom: 18,
    minZoom: 3
});
var imgm = L.tileLayer.chinaProvider('GaoDe.Satellite.Map', {
    maxZoom: 18,
    minZoom: 3
});
var imga = L.tileLayer.chinaProvider('GaoDe.Satellite.Annotion', {
    maxZoom: 18,
    minZoom: 3
});

var normal = L.layerGroup([normalm]),
    image = L.layerGroup([imgm, imga]);

var baseLayers = {
    "地图": normal,
    "影像": image,
}

var map = L.map("map", {
    center: [31.59, 120.29],
    zoom: 12,
    layers: [normal],
    zoomControl: false
});

L.control.layers(baseLayers, null).addTo(map);
L.control.zoom({
    zoomInTitle: '放大',
    zoomOutTitle: '缩小'
}).addTo(map);

var photoLayer = L.photo.cluster().on('click', function (evt) {
    var photo = evt.layer.photo,
        template = '<img src="{url}"/></a><p>拍摄于{address}({data_time})</p>';

    if (photo.video && (!!document.createElement('video').canPlayType('video/mp4; codecs=avc1.42E01E,mp4a.40.2'))) {
        template = '<video autoplay controls poster="{url}" width="300" height="300"><source src="{video}" type="video/mp4"/></video>';
    };

    evt.layer.bindPopup(L.Util.template(template, photo), {
        className: 'leaflet-popup-photo',
        minWidth: 300
    }).openPopup();
});
if(data.rows.length>0){
    photoLayer.add(data.rows).addTo(map);
    map.fitBounds(photoLayer.getBounds());
}
//注意：导航 依赖 element 模块，否则无法进行功能性操作
layui.use('element', function () {
    var element = layui.element;

});
function addPhoto() {
    layui.use('layer', function () {
        var layer = layui.layer;
        layer.open({
            type: 1 //Page层类型
            , area: ['800px', '600px']
            , title: '记录生活'
            , shade: 0.4 //遮罩透明度
            , maxmin: true //允许全屏最小化
            , anim: 1 //0-6的动画形式，-1不开启
            , content: `<div class="layui-upload">
        <button type="button" class="layui-btn layui-btn-normal" id="testList">请选择图片</button> 
        <a class="gaode-url" target="_brank" href="https://lbs.amap.com/console/show/picker">高德地图定位获取</a>
        <input type="text" class="layui-input datetimes" id="datetimes" placeholder="这是个时间选择器,选好复制，格式:yyyy-MM-dd HH:mm:ss">
        <div class="layui-upload-list">
          <table class="layui-table">
            <thead>
              <tr><th>文件名</th>
                <th>预览</th>
              <th>大小</th>
              <th>状态</th>
              <th>操作</th>
            </tr></thead>
            <tbody id="demoList"></tbody>
          </table>
        </div>
        <button type="button" class="layui-btn" id="testListAction">开始上传</button>
      </div>`
        });
        layui.use('laydate', function () {
            var laydate = layui.laydate;
            //日期时间选择器
            laydate.render({
                elem: '#datetimes'
                , type: 'datetime'
            });

        });
    });
    layui.use('upload', function () {
        var $ = layui.jquery
            , upload = layui.upload;
        //多文件列表示例
        var demoListView = $('#demoList')
            , uploadListIns = upload.render({
                elem: '#testList'
                , url: 'upload💕index'
                , accept: 'file'
                , multiple: true
                , auto: false
                , exts: 'jpg|JPG|jpeg|png|gif'
                , bindAction: '#testListAction'
                , choose: function (obj) {
                    // console.log(obj)
                    var files = this.files = obj.pushFile(); //将每次选择的文件追加到文件队列
                    var that = this;
                    //刷新页面
                    document.querySelector('.layui-layer-close').onclick = function() { 
                        location.reload();
                    } 
                    //读取本地文件
                    obj.preview(function (index, file, result) {
                        var tr = $(['<tr id="upload-' + index + '">'
                            , '<td ><div class="file-name">' + file.name + '</div></td>'
                            , '<td><img src="' + result + '" alt="' + file.name + '" class="layui-upload-img"></td>'
                            , '<td>' + (file.size / 1014).toFixed(1) + 'kb</td>'
                            , '<td>等待上传</td>'
                            , '<td>'
                            , '<p class="demo-reload-p layui-hide gaode-url" >图片EXIF数据缺失</p>'
                            , '<p class="demo-reload-p-lng-and-lat gaode-url layui-hide">请填入经纬度，和拍摄时间</p>'
                            , '<input class="layui-input demo-reload-lng-and-lat layui-hide"  type="text" name="lng" lay-verify="lng" autocomplete="off" placeholder="经纬度,用','号隔开">'
                            , '<input class="layui-input demo-reload-time layui-hide" type="text" name="time" lay-verify="time" autocomplete="off" placeholder="拍摄时间">'
                            // ,'<input type="text" class="layui-input datetimes" id="test5" placeholder="yyyy-MM-dd HH:mm:ss">'
                            , '<button class="layui-btn layui-btn-xs demo-reload layui-hide">重传</button>'
                            , '<button class="layui-btn layui-btn-xs layui-btn-danger demo-delete">删除</button>'
                            , '</td>'
                            , '</tr>'].join(''));
                        //单个重传
                        tr.find('.demo-reload').on('click', function () {
                            var tr = demoListView.find('tr#upload-' + index)
                                , tds = tr.children();
                            let lngAndLat = tds.eq(4).find('.demo-reload-lng-and-lat').val(); //经纬度
                            let time = tds.eq(4).find('.demo-reload-time').val(); //时间
                            if (lngAndLat) {
                                // file = file[index];
                                let param = new FormData(); //创建form对象
                                param.append('lng-and-lat', lngAndLat);
                                param.append('time', time);
                                param.append('file', file, file.name);
                                let config = {
                                    headers: { 'Content-Type': 'multipart/form-data' }
                                };  //添加请求头
                                // let that = this;

                                axios.post('/upload💕index', param, config)
                                    .then(function (response) {
                                        if (response.data.code == 2000) { //上传成功
                                            var tr = demoListView.find('tr#upload-' + index)
                                                , tds = tr.children();
                                            tds.eq(3).html('<span style="color: #5FB878;">上传成功</span>');
                                            tds.eq(4).html("拍摄于" + response.data.address); //清空操作
                                            return delete that.files[index]; //删除文件队列已经上传成功的文件
                                        }
                                    });
                                // file.lng = lng;
                                // file.lat = lat;
                                // file.time = time;
                                // console.log(obj)
                                // obj.upload(index, file);
                            } else {
                                tds.eq(4).find('.demo-reload-p-lng').removeClass('layui-hide'); //显示提示
                                tds.eq(4).find('.demo-reload-p-lat').removeClass('layui-hide'); //显示提示
                            }

                        });
                        //删除
                        tr.find('.demo-delete').on('click', function () {
                            delete files[index]; //删除对应的文件
                            tr.remove();
                            uploadListIns.config.elem.next()[0].value = ''; //清空 input file 值，以免删除后出现同名文件不可选
                        });

                        demoListView.append(tr);
                    });
                }
                , done: function (res, index, upload) {
                    // res = JSON.parse(res);

                    if (res.code == 2000) { //上传成功
                        var tr = demoListView.find('tr#upload-' + index)
                            , tds = tr.children();
                        tds.eq(3).html('<span style="color: #5FB878;">上传成功</span>');
                        tds.eq(4).html("拍摄于" + res.address); //清空操作
                        return delete this.files[index]; //删除文件队列已经上传成功的文件
                    }
                    if (res.code == 4001) {
                        var tr = demoListView.find('tr#upload-' + index)
                            , tds = tr.children();
                        tds.eq(3).html('<span style="color: #FF5722;">上传失败</span>');
                        tds.eq(4).find('.demo-reload-p').removeClass('layui-hide'); //显示重传
                        tds.eq(4).find('.demo-reload-p-lng-and-lat').removeClass('layui-hide'); //显示重传
                        tds.eq(4).find('.demo-reload-lng-and-lat').removeClass('layui-hide'); //显示重传
                        tds.eq(4).find('.demo-reload-time').removeClass('layui-hide'); //显示重传
                        tds.eq(4).find('.demo-reload').removeClass('layui-hide'); //显示重传 
                    }
                    if (res.code == 4004) {
                        var tr = demoListView.find('tr#upload-' + index)
                            , tds = tr.children();
                        tds.eq(3).html('<span style="color: #FF5722;">' + res.msg + '</span>');
                        tds.eq(4).html('禁止操作'); //禁止操作
                    }
                }
                , error: function (index, upload) {

                }
            });
    });
};
