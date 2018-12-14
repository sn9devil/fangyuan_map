//创建地图
var map = new AMap.Map('container', {
    resizeEnable: true, //是否监控地图容器尺寸变化
    zoom:10, //初始化地图层级
    zooms:[10,18],//限制缩放级别
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


communitys =[]
function community_addmarke(data, num) {
    data.forEach(function(item,num){
        var community = new AMap.Marker({
            position: item['lnglat'],
            content: '<div class="fangzi"><i class="wenzi">'+item['name']+item['num']+'套</i></div><div class="in"></div>',
            offset: new AMap.Pixel(-15, -15),
            extData: {'name':item['name']}
        })
        communitys.push(community)
        community.on('click', function (e) {
            get_data(community.getExtData().name);
        })
    })
}
community_addmarke(community_data)


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


function get_data(name) {
    $.ajax({
        type: "get",
        url: "/api/getData",
        data: {'community':name},
        contentType: 'application/json',
        success: function (data, status) {
            var li = $('#data>li');
            li.remove();
            data.forEach(function (item,num) {
                if(!item['img']){
                    item['img'] = '/static/kongfang.jpg';
                }
                var data_html = '<li><div class="img-left"><img src="' + item['img'] + '"></img></div> <div class="text-right"> <p class="text-tle">' + item['title'] + '</p> <p class="text-des"> <span class="sp2">' + item['house_type'] + '</span><span>' + item['area'] + '</span><span class="sp1">' + item['price'] + '<span class="sp3">元/月</span></span> </p> <p class="text-des"> <span class="sp4">' + item['community'] + '</span> </p> </div></li>'
                var ul = $('#data');
                ul.append(data_html);

            })
        }
    })
}
// get_data();




function forEach_addevent(lists, func){
    lists.forEach(function (item,num){
        eval(func);
    })
}

function forEach_addevent_position(lists){
    lists.forEach(function (item, num) {
        AMap.event.addListener(item, 'click', function () {
            map.setZoomAndCenter(16,item.getPosition());
        });
    })
}

//缩放 显示
qu_tag = 0
commtiy_tag = 0
position_tag = 0
map.on('zoomchange', function(e) {

    if(map.getZoom()>12 && map.getZoom()<16 ) {
        //第一次缩放
        if(position_tag===0){

            cluster = new AMap.MarkerClusterer(map, positions, {gridSize: 60,minClusterSize:10,maxZoom:5});
            forEach_addevent(markers, 'item.hide()');
            forEach_addevent_position(positions);
            qu_tag = 2
            position_tag = 1;
        }
        //缩放到zoom:13时，清除市标志,添加position标志
        if(position_tag===2){

            forEach_addevent(markers, 'item.hide()');
            forEach_addevent(positions,'item.show()');
            forEach_addevent(communitys,'item.hide()');
            position_tag = 1;
            qu_tag = 2;
            if(commtiy_tag===1) {
                commtiy_tag = 2;
            }
        }
    }
    //缩放到zoom:12时，添加市标志,删除position标志
    if(map.getZoom()<13) {
        if(qu_tag===2){
            forEach_addevent(markers, 'item.show()');
            forEach_addevent(positions,'item.hide()');
            qu_tag = 1;
            if(position_tag===1){
                position_tag = 2;
            }
        }
    }
    if(map.getZoom()>15) {
        if(commtiy_tag===0){

            forEach_addevent(positions,'item.hide()');
            community_cluster = new AMap.MarkerClusterer(map, communitys, {gridSize: 60,minClusterSize:10,maxZoom:5});
            forEach_addevent(communitys,'item.show()');
            commtiy_tag = 1;
            position_tag = 2;
        }
        if(commtiy_tag===2){

            forEach_addevent(positions,'item.hide()');
            forEach_addevent(communitys,'item.show()');
            commtiy_tag = 1;
            position_tag = 2;
        }

    }

});


//地图加载完成 添加事件
map.on('complete', function(e) {
    qu_markers_event();
})

