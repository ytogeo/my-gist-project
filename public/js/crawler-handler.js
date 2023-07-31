var resultJson = "";
var mapOfCityAndIndex = new Map(); //用于存储城市名和对应的指数和排名
const startHourCode = 1679137200000; // 对应2023-3-18-19:00

function getRankData() {
    $.ajax({
        cache: false,
        type: "get",
        //这里填数据发送到的url，与后端填的要一样
        url: "http://localhost:5505/getRankData",
        async: false, //这里要把异步设置为false，不然会先执行后面的语句，导致resultJson为空
        success: function (res) {
            //console.log(res);
            resultJson = res;
            //将json结果写入到html中
            for (let i = 1; i <= resultJson.length; i++) {
                var idOfName = i + "-1";
                var idOfIndex = i + "-2";
                var idOfSpeed = i + "-3";
                document.getElementById(idOfName).innerText = resultJson[i - 1].name;
                document.getElementById(idOfIndex).innerText = resultJson[i - 1].index;
                //将城市名和对应的指数和排名存入map中
                mapOfCityAndIndex.set(resultJson[i - 1].name, {
                    index: resultJson[i - 1].index,
                    rank: i
                });
                document.getElementById(idOfSpeed).innerText = resultJson[i - 1].speed;
            }
        },
        error: function (err) {
            console.log(err);
        }
    })
    // //之后每300秒获取一次数据
    // setInterval(function () {
    //     getRankData();
    // }, 300000);
}

function getDailyHealthyIndex() {
    $.ajax({
        cache: false,
        type: "get",
        //这里填数据发送到的url，与后端填的要一样（对应）
        url: "http://localhost:5505/getHealthyIndex",
        async: false, //这里要把异步设置为false，不然会先执行后面的语句，导致resultJson为空
        success: function (res) {
            //console.log(res);
            resultJson = res;
            var options = healthyIndexEchart.getOption();
            var data = [];
            var xAxisData = [];
            //处理x轴起始时间
            var curStartTimeCode = parseInt(resultJson[0][0]);
            var curStartTime = (curStartTimeCode % startHourCode) / 3600000;
            var curStartHour = curStartTime + 19;
            //计算当前的小时数
            if (curStartHour >= 24) {
                curStartHour %= 24;
            }
            //如果小于10，在前面加个0
            if (curStartHour < 10) {
                curStartHour = "0" + curStartHour;
            }
            //将json结果设置到option中
            for (let i = 0; i < resultJson.length; i++) {
                data.push(resultJson[i][1])
                //计算当前的小时数            
                if (curStartHour >= 24) {
                    curStartHour %= 24;
                }
                //如果小于10且不是0（'00'），在前面加个0
                if (curStartHour < 10 && curStartHour != '00') {
                    curStartHour = "0" + curStartHour;
                }
                xAxisData.push(curStartHour + ":00");
                curStartHour++;
            }
            //将新的option设置给表。xAxis必须整体重新设置，才能更新到它的data
            var xAxis = [{
                type: 'category',
                data: xAxisData, //data更新在这里
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: "rgba(255,255,255,.1)",
                        width: 1,
                        type: "solid"
                    },
                },
                axisTick: {
                    show: false,
                },
                axisLabel: {
                    interval: 2,
                    // rotate:50,
                    show: true,
                    splitNumber: 5,
                    textStyle: {
                        color: "rgba(255,255,255,.6)",
                        fontSize: '12',
                    },
                },
            }];
            options.series[0].data = data;
            options.xAxis = xAxis;
            healthyIndexEchart.setOption(options);
        },
        error: function (err) {
            console.log(err);
        }
    })
    // //之后每300秒获取一次数据
    // setInterval(function () {
    //     getDailyHealthyIndex();
    // }, 300000);
}

function getRadarData() {
    $.ajax({
        cache: false,
        type: "get",
        //这里填数据发送到的url，与后端填的要一样
        url: "http://localhost:5505/getHexagonIndex",
        async: false, //这里要把异步设置为false，不然会先执行后面的语句，导致resultJson为空
        success: function (res) {
            resultJson = res;
            //将json结果放进雷达图中
            var data = [];
            var realData = []; //真实数据，用在tooltip
            data.push(resultJson.cityRow[0]);
            realData.push(resultJson.indicators[0].value.toFixed(2));
            for (let i = resultJson.cityRow.length - 1; i > 0; i--) {
                data.push(resultJson.cityRow[i]);
                realData.push(resultJson.indicators[i].value);
            }
            var options = hexagonRadarEchart.getOption();
            for (let i = 0; i < options.series[0].data.length; i++) {
                options.series[0].data[i].value[i] = data[i];
            }
            options.series[0].data[6].value = data;
            hexagonRadarEchart.setOption(options);
            realHexagonData = realData;
        },
        error: function (err) {
            console.log(err);
        }
    })
    // //之后每300秒获取一次数据
    // setInterval(function () {
    //     getRankData();
    // }, 300000);
}

function getCurrentHealthyIndex() {
    $.ajax({
        cache: false,
        type: "get",
        //这里填数据发送到的url，与后端填的要一样
        url: "http://localhost:5505/getCurrentHealthyIndex",
        async: false, //这里要把异步设置为false，不然会先执行后面的语句，导致resultJson为空
        success: function (res) {
            //找到武汉市的jsonobj
            var wuhanId = 0;
            var resultJson = res.filter(function (data, index) {
                return data.cityName == "武汉市";
            });
            wuhanId = res.findIndex(function (data) {
                return data.cityName == "武汉市";
            });
            //为DOM赋值
            document.getElementById("healthyIndexBox").innerText = (resultJson[0].healthValue * 100).toFixed(2);
            document.getElementById("curRank").innerText = wuhanId + 1;
            document.getElementById("curDelayIndex").innerText = resultJson[0].idx.toFixed(2);
            document.getElementById("curRealSpeed").innerText = resultJson[0].realSpeed.toFixed(2);
            if (resultJson[0].healState == 1) {
                document.getElementById("healState").innerHTML = "健康";
                document.getElementById("healState").style.backgroundColor = '#4A9FF4B6';
            } else {
                document.getElementById("healState").innerHTML = "亚健康";
                document.getElementById("healState").style.backgroundColor = '#9070F7B7';
            }
        },
        error: function (err) {
            console.log(err);
        }
    })
    // //之后每300秒获取一次数据
    // setInterval(function () {
    //     getCurrentHealthyIndex();
    // }, 300000);
}
var routeJamJson;

function getRouteJamData() {
    $.ajax({
        cache: false,
        type: "get",
        //这里填数据发送到的url，与后端填的要一样
        url: "http://localhost:5505/getRouteJamData",
        async: false, //这里要把异步设置为false，不然会先执行后面的语句，导致resultJson为空
        success: function (res) {
            routeJamJson = res;
        },
        error: function (err) {
            console.log(err);
        }
    })
}
//初始获取一次数据，需要在页面加载完成后执行，否则几个echart的表还未加载完（$）
$(document).ready(function () {
    getRankData();
    getDailyHealthyIndex();
    getCurrentHealthyIndex();
    getRadarData();
    getRouteJamData();
    //之后每300秒获取一次数据
    setInterval(function () {
        getRankData();
        getDailyHealthyIndex();
        getCurrentHealthyIndex();
        getRadarData();
        getRouteJamData();
    }, 300000);
});