var myRequest = require('request')
var myCheerio = require('cheerio')
var myIconv = require('iconv-lite')
var myExpress = require("express");
var app = myExpress();


var myEncoding = "UTF-8";
var rankDataURL = 'https://trp.autonavi.com/ajax/districtRank.do?linksType=4&cityCode=420100';
var hourlyHealthyIndexURL = "https://trp.autonavi.com/ajax/cityHourly.do?cityCode=420100&dataType=1";
var hexagonRadarIndexURL = "https://trp.autonavi.com/diagnosis/ajax/9indicators.do?type=24&adcode=420100";
var currentHealthyIndexURL = "https://trp.autonavi.com/diagnosis/rank.do";
var routeJamURL = "https://report.amap.com/ajax/roadRank.do?roadType=0&timeType=0&cityCode=420100";

//请求头设置
var headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36',
    //高德有反爬虫机制，需要设置cookie
    'cookie': '填入cookie',
    //不缓存
    //'Cache-Control': 'no-cache'
}

//request模块异步fetch url
function request(url, callback) {
    var options = {
        url: url,
        encoding: null,
        //proxy: 'http://x.x.x.x:8080',
        headers: headers,
    }
    //调用request包里的方法
    myRequest(options, callback)
}
/**
 * 用express模块启动一个服务器，用于传值给前端
 */
//设置监听(监听端口，回调函数(返回的值显示在cmd中))
app.listen(5505, function () {
    console.log("服务器已启动");
})

//根路径
app.use('/static', myExpress.static('public'));

var jsonArrayOfRouteJam;
var jsonArrayOfRankData;
var jsonArrayOfHourlyHealthyIndex;
var jsonArrayOfHexagonRadarIndex;
var jsonArrayOfCurrentHealthyIndex;

function getData(callback) {
    request(rankDataURL, function (err, res, body) {
        var html = myIconv.decode(body, myEncoding);
        //用cheerio解析html
        $ = myCheerio.load(html, {
            decodeEntities: true
        });
        //获得body里的JSON数组内容
        jsonArrayOfRankData = JSON.parse($('body').text());
    })
    request(hourlyHealthyIndexURL, function (err, res, body) {
        var html = myIconv.decode(body, myEncoding);
        //console.log(html);
        //用cheerio解析html
        $ = myCheerio.load(html, {
            decodeEntities: true
        });
        //获得body里的JSON数组内容
        jsonArrayOfHourlyHealthyIndex = JSON.parse($('body').text());
        //这里的路径填的是数据发送到的url（localhost:5502+/getData）
    })
    request(hexagonRadarIndexURL, function (err, res, body) {
        var html = myIconv.decode(body, myEncoding);
        //console.log(html);
        //用cheerio解析html
        $ = myCheerio.load(html, {
            decodeEntities: true
        });
        //获得body里的JSON数组内容
        jsonArrayOfHexagonRadarIndex = JSON.parse($('body').text());
    })
    request(currentHealthyIndexURL, function (err, res, body) {
        var html = myIconv.decode(body, myEncoding);
        $ = myCheerio.load(html, {
            decodeEntities: true
        });
        jsonArrayOfCurrentHealthyIndex = JSON.parse($('body').text());
    })
    request(routeJamURL, function (err, res, body) {
        var html = myIconv.decode(body, myEncoding);
        $ = myCheerio.load(html, {
            decodeEntities: true
        });
        jsonArrayOfRouteJam = JSON.parse($('body').text());
    })
}
function sendData(){
    app.get("/getRankData", function (req, res, next) {
        //发送数据到上面路径指定的前端页面
        res.set('Cache-Control', 'no-cache');
        res.json(jsonArrayOfRankData);
    })
    app.get("/getHealthyIndex", function (req, res, next) {
        //发送数据到上面路径指定的前端页面
        res.set('Cache-Control', 'no-cache');
        res.json(jsonArrayOfHourlyHealthyIndex);
    })
    app.get("/getHexagonIndex", function (req, res, next) {
        //发送数据到上面路径指定的前端页面
        res.set('Cache-Control', 'no-cache');
        res.json(jsonArrayOfHexagonRadarIndex);
    })
    app.get("/getCurrentHealthyIndex", function (req, res, next) {
        //发送数据到上面路径指定的前端页面
        res.set('Cache-Control', 'no-cache');
        res.json(jsonArrayOfCurrentHealthyIndex);
    })
    app.get("/getRouteJamData", function (req, res, next) {
        //发送数据到上面路径指定的前端页面
        res.set('Cache-Control', 'no-cache');
        res.json(jsonArrayOfRouteJam);
    })
    console.log("send data!");
}
var $ = null;

getData(sendData());
setInterval(function () {
    getData(sendData());
    console.log("执行定时器");
}, 300000)
