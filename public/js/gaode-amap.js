window._AMapSecurityConfig = {
    securityJsCode: "******************",
}
var isBigWindowAmapHidden = true;
var map; //小窗的地图
var bigMap; //大窗的地图
var traffic;
var bigTraffic;
var isTrafficDisplay = false;
//输入提示
var autoOptionsOfOrigin = {
    city: '武汉',
    input: "origin"
};
var autoOptionsOfDestination = {
    city: '武汉',
    input: "destination"
};

AMapLoader.load({
    key: "********************", // 申请好的Web端开发者Key，首次调用 load 时必填
    "plugins": ['AMap.AutoComplete'],
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
}).then((AMap) => {
    //输入提示
    var autoCompleteOfOrigin = new AMap.AutoComplete(autoOptionsOfOrigin);
    var autoCompleteOfDestination = new AMap.AutoComplete(autoOptionsOfDestination);
    //大窗的地图加载
    bigMap = new AMap.Map('bigWindowAmap', {
        mapStyle: 'amap://styles/blue',
        center: [114.304569, 30.593354]
    });
    bigTraffic = new AMap.TileLayer.Traffic({
        'autoRefresh': true, //是否自动刷新，默认为false
        'interval': 180, //刷新间隔，默认180s
    });
    bigMap.add(bigTraffic); //通过add方法添加图层
    bigTraffic.hide();
    //小窗的地图加载
    map = new AMap.Map('map2DContainer', {
        mapStyle: 'amap://styles/blue',
        center: [114.304569, 30.593354]
    });
    traffic = new AMap.TileLayer.Traffic({
        'autoRefresh': true, //是否自动刷新，默认为false
        'interval': 180, //刷新间隔，默认180s
    });
    map.add(traffic); //通过add方法添加图层
    traffic.hide();
}).catch((e) => {
    console.error(e); //加载错误提示
});


function displayTrafficLayer() {
    if (!isTrafficDisplay) {
        AMapLoader.load({
            version: "2.0",
        }).then((AMap) => {
            traffic.show();
            bigTraffic.show();
        })
        isTrafficDisplay = true;
    } else {
        traffic.hide();
        bigTraffic.hide();
        isTrafficDisplay = false;
    }
}
var driving;
var drivingForSmall;
// var startLngLat = [114.401144, 30.522078]
// var endLngLat = [114.617104, 30.457544]

function routePlanningService(callback) {
    AMapLoader.load({
        "plugins": ['AMap.Driving'],
        version: "2.0",
    }).then((AMap) => {
        var origin = document.getElementById("origin").value;
        var destination = document.getElementById("destination").value;
        //清除上一次结果
        if (driving) {
            driving.clear();
            drivingForSmall.clear();
        }
        //新建Driving类对象
        driving = new AMap.Driving({
            map: bigMap,
        });
        drivingForSmall = new AMap.Driving({
            map: map,
        });
        // drivingForSmall.search(startLngLat, endLngLat, function (status, result) {
        //     callback(result);
        // })
        //大窗显示路径规划结果
        driving.search([{
                keyword: origin,
                city: '武汉'
            },
            {
                keyword: destination,
                city: '武汉'
            }
        ], function (status, result) {
            if (status === 'complete') {
                callback(result);
            } else {

                //console.log('获取驾车数据失败：' + result)
            }
        })
        //小窗显示路径规划结果
        drivingForSmall.search([{
                keyword: origin,
                city: '武汉'
            },
            {
                keyword: destination,
                city: '武汉'
            }
        ], function (status, result) {
            if (status === 'complete') {
                //不要反复回调
                //callback(result);
            } else {
                //console.log('获取驾车数据失败：' + result)
            }
        })
    })

}
