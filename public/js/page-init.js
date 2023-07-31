let isJamDisplay = false; //拥堵情况是否展示
/**
 * 用到的一些常量
 */
// 武汉经纬度
let lon = 114.304569;
let lat = 30.593354;
// Cesium密钥
const defaultAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyYTQ1YWM4Yi1jMWQ2LTRjODktYWUwZi1iN2E3MGY0YTc4NzUiLCJpZCI6MTI2OTc3LCJpYXQiOjE2Nzc3NDg2MTB9.1sM-0Hkm_FzlYZFqnTQlYyLVWZcJqg8EelxDssdjl28';
// 天地图密钥
var token = 'b9b78678db92aec1143ce773032cd698';
// 天地图服务域名
var tdtUrl = 'https://t7.tianditu.gov.cn/';

/**
 * 时间显示
 */
var t = null;
t = setTimeout(time, 1000); //开始运行
function time() {
    clearTimeout(t); //清除定时器
    dt = new Date();
    var y = dt.getFullYear();
    var mt = dt.getMonth() + 1;
    var day = dt.getDate();
    var h = dt.getHours(); //获取时
    if (h < 10) {
        h = "0" + h;
    }
    var m = dt.getMinutes(); //获取分
    if (m < 10) {
        m = "0" + m;
    }
    var s = dt.getSeconds(); //获取秒
    if (s < 10) {
        s = "0" + s;
    }
    document.getElementById("showTime").innerHTML = y + "/" + mt + "/" + day + " " + h + ":" + m + ":" + s + "";
    t = setTimeout(time, 1000); //设定定时器，循环运行     
}

/**
 * cesium初始化
 */
Cesium.Ion.defaultAccessToken = defaultAccessToken;
//初始化viewer
const vecLayer = new Cesium.UrlTemplateImageryProvider({
    url: tdtUrl + "vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=" + token,
    minimumLevel: 3,
    maximumLevel: 18
});

const viewer = new Cesium.Viewer("cesiumContainer", {
    imageryProvider: vecLayer,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    baseLayerPicker: false,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
    fullscreenButton: false,
    vrButton: false,
    infoBox: false,
    shouldAnimate: true,
    //selectionIndicator: false
});

//调整为暗色地图
var imagery = viewer.imageryLayers.addImageryProvider(vecLayer);
imagery.hue = 3;
imagery.contrast = -1.2;

//时间调整为夜晚并启用（根据时间的）光照，以关闭日照
var utc = Cesium.JulianDate.fromDate(new Date("2023/03/15 20:30:00")); //UTC
viewer.clock.currentTime = Cesium.JulianDate.addHours(utc, 8, new Cesium.JulianDate()); //北京时间=UTC+8=GMT+8
viewer.scene.globe.enableLighting = true;


//添加武汉市建筑tileset
var tileset = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
        url: "data/wuhanTileset/tileset.json",
    })
);

//分级设置建筑物颜色
tileset.style = new Cesium.Cesium3DTileStyle({
    color: {
        conditions: [
            ['${Elevation} >= 213', "color('steelblue', 0.9)"],
            ['${Elevation} >= 129', "color('aquamarine', 0.8)"],
            ['${Elevation} >= 21', "color('dodgerblue', 0.9)"],
            ['${Elevation} >= 3', "color('lightskyblue', 0.9)"],
        ]
    }
})

//loading动画的实现（监听瓦片加载是否完成）
var helper = new Cesium.EventHelper();
helper.add(viewer.scene.globe.tileLoadProgressEvent, function (e) {
    console.log('仍在加载初始瓦片...');
    if (e == 0) {
        console.log("完成加载瓦片。")
        document.getElementById("loadingBox").style.display = "none";
        document.getElementsByClassName("cesium-viewer")[0].style.visibility = "visible";
        if (tileset.ready) {
            viewer.flyTo(tileset, {
                duration: 6,
            });
        }
        //注销事件监听，防止重复回调
        helper.removeAll();
    }
});

//展示区域拥堵情况
function displayJamArea() {
    if (!isJamDisplay) {
        //返回的是一个加载完成的Promise
        let geojsonCompletePromise = new Cesium.GeoJsonDataSource.load('data/wuhan.geojson', {
            stroke: Cesium.Color.BLUE,
            fill: Cesium.Color.PINK.withAlpha(0.5),
            strokeWidth: 3
        });
        //加载完成后，添加到viewer中
        geojsonCompletePromise.then(function (dataSource) {
            viewer.dataSources.add(dataSource);
            let polygons = dataSource.entities.values;
            for (var i = 0; i < polygons.length; i++) {
                //不知道为什么蔡甸区被分成了三块
                // if (i == 10 || i == 11) {
                //     continue;
                // }
                let polygon = polygons[i];
                /*
                 *设置position，设置了position才能显示注记！
                 */
                var pointsArray = polygon.polygon.hierarchy.getValue().positions;
                //获取entity的polygon的中心点
                var centerpoint = Cesium.BoundingSphere.fromPoints(pointsArray).center;
                //将entity的position设置为centerpoint
                polygon.position = centerpoint;
                //添加注记
                polygon.label = {
                    position: centerpoint,
                    show: true,
                    text: mapOfCityAndIndex.get(polygon.properties.NAME.getValue()).index.toString(),
                    showBackground: true,
                    font: '14px sans-serif',
                    fillColor: Cesium.Color.SKYBLUE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                }
                if (mapOfCityAndIndex.get(polygon.name).index < 1.5) {
                    polygon.polygon.material = Cesium.Color.LIMEGREEN.withAlpha(0.65);
                } else if (1.5 <= mapOfCityAndIndex.get(polygon.name).index && mapOfCityAndIndex.get(polygon.name).index < 1.8) {
                    polygon.polygon.material = Cesium.Color.GOLD.withAlpha(0.65);
                } else if (1.8 <= mapOfCityAndIndex.get(polygon.name).index && mapOfCityAndIndex.get(polygon.name).index < 2.0) {
                    polygon.polygon.material = Cesium.Color.CHOCOLATE.withAlpha(0.65);
                } else {
                    polygon.polygon.material = Cesium.Color.ORANGERED.withAlpha(0.65);
                }
            }
        })
        isJamDisplay = true;
    } else {
        viewer.dataSources.removeAll();
        isJamDisplay = false;
    }
}
var isDisplaySwitch = false;

/**
 * 切换显示
 */
function displaySwitch() {
    if (!isDisplaySwitch) {
        document.getElementById("bigWindowAmap").style.visibility = "visible";
        document.getElementById("cesiumContainer").style.visibility = "hidden";
        document.getElementById("map2DContainer").style.visibility = "hidden";
        document.getElementById("mapDisplayHint").style.visibility = "visible";
        isDisplaySwitch = true;
    } else {
        document.getElementById("bigWindowAmap").style.visibility = "hidden";
        document.getElementById("cesiumContainer").style.visibility = "visible";
        document.getElementById("map2DContainer").style.visibility = "visible";
        document.getElementById("mapDisplayHint").style.visibility = "hidden";
        isDisplaySwitch = false;
    }
}

/**
 * 展示标识堵塞道路的点
 */
var jamPoints = new Array();
const pinBuilder = new Cesium.PinBuilder();
var pinURI = pinBuilder.fromText("!", Cesium.Color.FIREBRICK, 38).toDataURL();
var isDisplayRouteJamPoint = false;

function displayRouteJamPoint() {
    if (!isDisplayRouteJamPoint) {
        //加载堵塞点实体
        for (let i = 0; i < routeJamJson.tableData.length; i++) {
            var positions = gcj02towgs84(routeJamJson.tableData[i].coords[0].lon, routeJamJson.tableData[i].coords[0].lat);
            var pin = viewer.entities.add({
                id: i + 1,
                position: Cesium.Cartesian3.fromDegrees(positions[0], positions[1]),
                billboard: {
                    image: pinURI,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                },
            });
            jamPoints.push(pin);
        }
        isDisplayRouteJamPoint = true;
        //点击事件
        var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction(function (e) {
            var pick = viewer.scene.pick(e.position);
            if (pick && pick.id) {
                //在信息框中展示信息
                document.getElementById("roadName").innerText = routeJamJson.tableData[pick.id.id - 1].name;
                document.getElementById("dirName").innerText = routeJamJson.tableData[pick.id.id - 1].dir;
                document.getElementById("jamIndex").innerText = routeJamJson.tableData[pick.id.id - 1].index;
                document.getElementById("speed").innerText = routeJamJson.tableData[pick.id.id - 1].speed;
                document.getElementById("travelTime").innerText = routeJamJson.tableData[pick.id.id - 1].travelTime;
                document.getElementById("delayTime").innerText = routeJamJson.tableData[pick.id.id - 1].delayTime;
                //显隐处理
                document.getElementById("jamPointInfoTable").style.visibility = "visible";
                document.getElementById("infoDisplayHint").style.visibility = "hidden";
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        console.log(handler)
    } else {
        for (let i = 0; i < jamPoints.length; i++) {
            viewer.entities.remove(jamPoints[i]);
        }
        isDisplayRouteJamPoint = false;
        document.getElementById("infoDisplayHint").style.visibility = "visible";
        document.getElementById("jamPointInfoTable").style.visibility = "hidden";
    }
}
var routeResult;

function displayRoutePlanningForm() {
    if (!isDisplayPlanningResult) {
        layer.open({
            type: 1,
            title: '路径规划',
            area: ['350px', '250px'],
            fix: false,
            content: $("#routePlanning"),
            btn: ['确定', '重置'],
            btn1: function () {
                //通过回调函数获取异步的返回值result
                routeResult = routePlanningService(function (result) {
                    renderPlanningResult(result);
                    drawDynamicVehicle();
                });
                layer.msg("已绘制路线");
                //异步完成后关闭当前页
                setTimeout(function () {
                    layer.closeAll();
                    document.getElementById("routePlanningForm").reset();
                }, 1000);
            },
            btn2: function () {
                document.getElementById("routePlanningForm").reset();
                return false;
            },
            end: function () {
                //防止弹出层关不掉
                $('#routePlanning').css({
                    'display': 'none'
                });
            }
        });
    } else {
        //cesium清空
        for (let i = 0; i < startAndEndPins.length; i++) {
            viewer.entities.remove(startAndEndPins[i]);
        }
        startAndEndPins = new Array();
        viewer.entities.remove(resultRoute);
        routePointsArray = new Array();
        //二维地图清空
        driving.clear();
        drivingForSmall.clear();
        //三维小车清空
        clearDynamicVehicle();
        //flag
        isDisplayPlanningResult = false;
    }
}
var isDisplayPlanningResult = false;
var startAndEndPins = new Array();
var routePointsArray = new Array();
var resultRoute;
var originPinURI = pinBuilder.fromText("起", Cesium.Color.LIMEGREEN, 38).toDataURL();
var destinationPinURI = pinBuilder.fromText("终", Cesium.Color.RED, 38).toDataURL();
//接收高德JSAPI返回的路径规划结果,并使用cesium渲染
function renderPlanningResult(result) {
    //绘制起点的pin
    var originPositions = gcj02towgs84(result.origin.getLng(), result.origin.getLat());
    var originPin = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(originPositions[0], originPositions[1]),
        billboard: {
            image: originPinURI,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        },
    });
    //绘制终点的pin
    var destinationPositions = gcj02towgs84(result.destination.getLng(), result.destination.getLat());
    var destinationPin = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(destinationPositions[0], destinationPositions[1]),
        billboard: {
            image: destinationPinURI,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        },
    });
    //存入数组
    startAndEndPins.push(originPin);
    startAndEndPins.push(destinationPin);
    //将途径点也加入routePoints数组，需要做坐标转换
    //起点
    var wgsOriginPostions = gcj02towgs84(result.origin.getLng(), result.origin.getLat());
    routePointsArray.push(wgsOriginPostions[0], wgsOriginPostions[1]);
    for (let i = 0; i < result.routes[0].steps.length; i++) {
        for (let j = 0; j < result.routes[0].steps[i].path.length; j++) {
            //途径点
            var wgsPostions = gcj02towgs84(result.routes[0].steps[i].path[j].getLng(), result.routes[0].steps[i].path[j].getLat());
            routePointsArray.push(wgsPostions[0], wgsPostions[1]);
        }
    }
    //终点
    var wgsDestinationPostions = gcj02towgs84(result.destination.getLng(), result.destination.getLat());
    routePointsArray.push(wgsDestinationPostions[0], wgsDestinationPostions[1]);
    resultRoute = viewer.entities.add({
        polyline: {
            show: true, //是否显示，默认显示
            positions: Cesium.Cartesian3.fromDegreesArray(routePointsArray),
            width: 2, //线的宽度（像素），默认为1
            material: Cesium.Color.ORANGE, //线的颜色，默认为白色
            clampToGround: true,
            zIndex: 1
        }
    });
    isDisplayPlanningResult = true;
    //setTimeout(drawDynamicVehicle(), 1000);
}

var car;
const gapSeconds = 0.0001;
/**
 * 删除小车
 */
function clearDynamicVehicle() {
    if (car) {
        viewer.entities.remove(car);
        car = undefined;
    }
}
/**
 * 绘制动态小车
 */
function drawDynamicVehicle() {
    console.log(routePointsArray)
    //设置动态小车的时间
    var start = Cesium.JulianDate.addHours(utc, 8, new Cesium.JulianDate());
    viewer.clock.startTime = start.clone();
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
    var position = new Cesium.SampledPositionProperty();
    //每两点之间
    var currentTime = start;
    for (let i = 0; i + 1 < routePointsArray.length; i += 2) {
        var location = new Cesium.Cartesian3.fromDegrees(routePointsArray[i], routePointsArray[i + 1]);
        position.addSample(currentTime, location);
        currentTime = Cesium.JulianDate.addHours(currentTime, gapSeconds, new Cesium.JulianDate());
    }
    viewer.clock.stopTime = currentTime.clone();
    console.log(position);
    //添加小车glb
    car = viewer.entities.add({
        name: 'a model car',
        position: Cesium.Cartesian3.fromDegrees(routePointsArray[0], routePointsArray[1]),
        orientation: new Cesium.VelocityOrientationProperty(position),
        model: {
            uri: "data/CesiumTruck.glb",
            minimumPixelSize: 52,
            maximumScale: 52,
            runAnimations: false,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
    })
    car.position = position;
}