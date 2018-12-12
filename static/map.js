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

//positions 标志
positions =[]
function position_addmarke(data, num) {
    geocoder = new AMap.Geocoder();
    geocoder.getLocation('广州市'+data, function(status, result){
        positions.push(new AMap.Marker({
            position: result.geocodes[0].location,
            content: '<div class="qutag"><div class="diqu">'+data+'<p>'+num+'套</p></div></div>',
            offset: new AMap.Pixel(-15, -15)
        }))
    })
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
                position_addmarke(data[i]['position'], parseInt(data[i]['sum']))
            }
        }
    })

}
get_position();



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

function forEach_addevent_position(lists){
    lists.forEach(function (item, num) {
        AMap.event.addListener(item, 'click', function () {
            map.setZoomAndCenter(15,item.getPosition());
        });
    })
}

tag = 0
map.on('zoomchange', function(e) {

    if(map.getZoom()>12) {
        //第一次缩放
        if(tag===0){
            cluster = new AMap.MarkerClusterer(map, positions, {gridSize: 60,minClusterSize:10,maxZoom:5});
            forEach_addevent(markers, 'item.hide()');
            forEach_addevent_position(positions);
            tag = 12;
        }
        //缩放到zoom:13时，清除市标志,添加position标志
        if(tag===13){
            forEach_addevent(markers, 'item.hide()');
            forEach_addevent(positions,'item.show()');
            tag = 12;
        }
    }
    //缩放到zoom:12时，添加市标志,删除position标志
    if(map.getZoom()<13) {
        if(tag===12){
            forEach_addevent(markers, 'item.show()');
            forEach_addevent(positions,'item.hide()');
            tag =13
        }
    }
});


//地图加载完成 添加事件
map.on('complete', function(e) {
    qu_markers_event();
})

