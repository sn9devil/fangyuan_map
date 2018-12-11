//创建地图
var map = new AMap.Map('container', {
    resizeEnable: true, //是否监控地图容器尺寸变化
    zoom:10, //初始化地图层级
    zooms:[10,15],//限制缩放级别
    center: [113.264385,23.129112] //初始化地图中心点
});


//添加比例尺
AMap.plugin(['AMap.Scale'],function(){
        map.addControl(new AMap.Scale());
})


//行政区域 图形
var district = null;
var polygons=[];
function drawBounds(data) {
    //加载行政区划插件
    if(!district){
        //实例化DistrictSearch
        var opts = {
            subdistrict: 0,   //获取边界不需要返回下级行政区
            extensions: 'all',  //返回行政区边界坐标组等具体信息
            level: 'district'  //查询行政级别为 市
        };
        district = new AMap.DistrictSearch(opts);
    }
    //行政区查询

    district.search(data, function(status, result) {
        //清除上次结果
        polygons = [];
        var bounds = result.districtList[0].boundaries;
        if (bounds) {
            for (var i = 0, l = bounds.length; i < l; i++) {
                //生成行政区划polygon
                var polygon = new AMap.Polygon({
                    strokeWeight: 1,
                    path: bounds[i],
                    fillOpacity: 0.4,
                    fillColor: '#80d8ff',
                    strokeColor: '#0091ea'
                });
                polygons.push(polygon);
            }
        }
        map.add(polygons)
        //map.setFitView(polygons);//视口自适应
    });
}




//地址转换坐标
// geocoder = new AMap.Geocoder();
// var convert = function (diqu){
//     geocoder.getLocation(diqu, function(status, result){
//     var a = result.geocodes[0].location;
//     return a;
//     //alert(a);
// });
// }

//给marker 添加事件
var markers = []
function qu_markers_event() {
    markers.forEach(function (marke,item) {
        marke.on('mouseover',function (e) {
            marke.setzIndex(200);
            drawBounds(marke.getExtData().dizhi);
        });
        marke.on('mouseout',function (e) {
            marke.setzIndex(100);
            map.remove(polygons);
        });
        //跳到下一级
        marke.on('click',function (e) {
            // var a =
            map.setZoomAndCenter(13,marke.getPosition());
        });
    });
}



//添加标记
function qu_addMarke(data,num){
    geocoder = new AMap.Geocoder();
    geocoder.getLocation('广州市'+data+'区', function(status, result){
        var marker = new AMap.Marker({
            map:map,
            //icon: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",
            content:'<div class="qutag"><div class="diqu">'+data+'<p>'+num+'套</p></div></div>',
            position: result.geocodes[0].location,
            offset: new AMap.Pixel(-13, -30),
            extData:{'dizhi':data+'区'}
        });
        markers.push(marker);
     });
}


//AJAX
function get_district() {
    $.ajax({
        type: "get",
        url: "/api/district",
        data: {},
        contentType: 'application/json',
        success: function (data, status) {
            for (var i = 0, l = data.length; i < l; i++) {
                //alert(i);
                qu_addMarke(data[i]['district'], parseInt(data[i]['sum']))
            }
        }
    })

}
get_district();

function get_position() {
    $.ajax({
        type: "get",
        url: "/api/position",
        data: {},
        contentType: 'application/json',
        success: function (data, status) {
            for (var i = 0, l = data.length; i < l; i++) {
                //alert(i);
                qu_addMarke(data[i]['position'], parseInt(data[i]['sum']))
            }
        }
    })

}




// function addMarker(dizhi) {
//     marker = new AMap.Marker({
//         icon: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",
//         content:'<div style="background-color: hsla(180, 100%, 50%, 0.7); height: 50px; width: 50px; border: 1px solid hsl(180, 100%, 40%); border-radius: 25px; box-shadow: hsl(180, 100%, 50%) 0px 0px 1px;">wwwe</div>',
//         position: dizhi,
//         offset: new AMap.Pixel(-13, -30),
//
//     });
//     marker.setMap(map);
// }
// addMarker(convert())


function forEach_addevent(lists, func){
    lists.forEach(function (item,num){
        eval(func);
    })
}
//缩放到1公里时，清除市标志
tag = 0
map.on('zoomchange', function(e) {
    if(map.getZoom()>12) {
        if(tag===0){
            forEach_addevent(markers, 'item.hide()');
            get_position();
            tag = 1;
        }
    }
    if(map.getZoom()<13){
        if(tag===1){
            forEach_addevent(markers, 'item.show()');
            tag = 0;
        }
    }
});


//地图加载完成 添加事件
map.on('complete', function(e) {
    qu_markers_event();
})
