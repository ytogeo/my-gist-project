$(window).load(function () {
    $(".loading").fadeOut()

})
var healthyIndexEchart;
var hexagonRadarEchart;

function initHealthyIndexGraph() {
    healthyIndexEchart = echarts.init(document.getElementById('healthyIndexGraph'));
    var healthyIndexOptions = {
        //  backgroundColor: '#00265f',
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '0%',
            top: '10px',
            right: '0%',
            bottom: '0',
            containLabel: true
        },
        xAxis: [{
            type: 'category',
            data: ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
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
        }],
        yAxis: [{
            min: 1.0,
            max: 2.5,
            interval: 0.5,
            type: 'value',
            axisLabel: {
                //formatter: '{value} %'
                show: true,
                textStyle: {
                    color: "rgba(255,255,255,.6)",
                    fontSize: '12',
                },
            },
            axisTick: {
                show: false,
            },
            axisLine: {
                show: true,
                lineStyle: {
                    color: "rgba(255,255,255,.1	)",
                    width: 1,
                    type: "solid"
                },
            },
            splitLine: {
                show: true,
                interval: 0.5,
                lineStyle: {
                    color: "rgba(255,255,255,.1)",
                }
            }
        }],
        series: [{
            name: '拥堵延时指数',
            type: 'line',
            symbolSize: 6,
            //smooth: true,
            data: [1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5],
            itemStyle: {
                normal: {
                    color: '#4169E1',
                    opacity: 1,
                    barBorderRadius: 5,
                    lineStyle: {
                        width: 4
                    }
                }
            },
            areaStyle: {
                normal: {
                    //设置颜色渐变
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: '#6495ED'
                        },
                        {
                            offset: 1,
                            color: 'transparent'
                        }
                    ], false)
                }
            }
        }],
    };
    healthyIndexEchart.setOption(healthyIndexOptions);
}
var realHexagonData = [0, 0, 0, 0, 0, 0];

function initHexagonRadarGraph() {
    hexagonRadarEchart = echarts.init(document.getElementById('hexagonRadarGraph'));
    var hexagonRadarOption = {
        radar: {
            // shape: 'circle',
            name: {
                textStyle: {
                    color: '#fff',
                    padding: [-8, -8]
                }
            },
            splitNumber: 3,
            splitArea: {
                areaStyle: {
                    color: ['#7FBEE6', '#438CC3', '#3570AB'],
                    shadowColor: 'rgba(0, 0, 0, 0.2)',
                    shadowBlur: 10
                }
            },
            radius: 85,
            center: ['50%', '50%'],
            indicator: [{
                    name: '路网高延时运行时间占比',
                    max: 3
                },
                {
                    name: '高峰\n平均速度',
                    max: 3
                },
                {
                    name: '骨干道路\n运行速度偏差率',
                    max: 3
                },
                {
                    name: '路网高峰行程延时指数',
                    max: 3
                },
                {
                    name: '常发拥堵路段\n里程比',
                    max: 3
                },
                {
                    name: '路网拥堵路段\n里程比',
                    max: 3
                }
            ]
        },
        // //tooltip要写在series外面
        tooltip: {},
        series: [{
            type: 'radar',
            data: [{
                    name: '路网高延时运行时间占比',
                    value: [2, null, null, null, null, null],
                    symbol: 'rect',
                    symbolSize: 3,
                    itemStyle: {
                        normal: {
                            color: '#ffffff',
                        }
                    },
                    lineStyle: {
                        normal: {
                            width: 3,
                            color: 'transparent'
                        }
                    },
                    z: 6,
                    tooltip: {
                        show: true,
                        confine: true,
                        trigger: 'item',
                        triggeron: 'mousemove',
                        formatter: function (params, x, y) {
                            return '路网高延时运行时间占比：' + (realHexagonData[0] * 100).toFixed(1) + '%';
                        }
                    }
                },
                {
                    name: '高峰平均速度',
                    value: [null, 2, null, null, null, null],
                    symbol: 'rect',
                    symbolSize: 3,
                    itemStyle: {
                        normal: {
                            color: '#ffffff',
                        }
                    },
                    lineStyle: {
                        normal: {
                            width: 3,
                            color: 'transparent'
                        }
                    },
                    tooltip: {
                        show: true,
                        confine: true,
                        trigger: 'item',
                        triggeron: 'mousemove',
                        formatter: function (params, x, y) {
                            return '高峰平均速度：' + realHexagonData[1].toFixed(2);
                        }
                    },
                    z: 6
                },
                {
                    name: '骨干道路运行速度偏差率',
                    value: [null, null, 2, null, null, null],
                    symbol: 'rect',
                    symbolSize: 3,
                    itemStyle: {
                        normal: {
                            color: '#ffffff',
                        }
                    },
                    lineStyle: {
                        normal: {
                            width: 3,
                            color: 'transparent'
                        }
                    },
                    tooltip: {
                        show: true,
                        confine: true,
                        trigger: 'item',
                        triggeron: 'mousemove',
                        formatter: function (params, x, y) {
                            return '骨干道路运行速度偏差率：' + (realHexagonData[2] * 100).toFixed(1) + '%';
                        }
                    },
                    z: 6
                },
                {
                    name: '路网高峰行程延时指数',
                    value: [null, null, null, 2, null, null],
                    symbol: 'rect',
                    symbolSize: 3,
                    itemStyle: {
                        normal: {
                            color: '#ffffff',
                        }
                    },
                    lineStyle: {
                        normal: {
                            width: 3,
                            color: 'transparent'
                        }
                    },
                    tooltip: {
                        show: true,
                        confine: true,
                        trigger: 'item',
                        triggeron: 'mousemove',
                        formatter: function (params, x, y) {
                            return '路网高峰行程延时指数：' + realHexagonData[3].toFixed(2);
                        }
                    },
                    z: 6
                },
                {
                    name: '常发拥堵路段里程比',
                    value: [null, null, null, null, 2, null],
                    symbol: 'rect',
                    symbolSize: 3,
                    itemStyle: {
                        normal: {
                            color: '#ffffff',
                        }
                    },
                    lineStyle: {
                        normal: {
                            width: 3,
                            color: 'transparent'
                        }
                    },
                    tooltip: {
                        show: true,
                        confine: true,
                        trigger: 'item',
                        triggeron: 'mousemove',
                        formatter: function (params, x, y) {
                            return '常发拥堵路段里程比：' + (realHexagonData[4] * 100).toFixed(1) + '%';
                        }
                    },
                    z: 6
                },
                {
                    name: '路网拥堵路段里程比',
                    value: [null, null, null, null, null, 2],
                    symbol: 'rect',
                    symbolSize: 3,
                    itemStyle: {
                        normal: {
                            color: '#ffffff',
                        }
                    },
                    lineStyle: {
                        normal: {
                            width: 3,
                            color: 'transparent'
                        }
                    },
                    tooltip: {
                        show: true,
                        confine: true,
                        trigger: 'item',
                        triggeron: 'mousemove',
                        formatter: function (params, x, y) {
                            return '路网拥堵路段里程比：' + (realHexagonData[5] * 100).toFixed(1) + '%';
                        }
                    },
                    z: 6
                },
                {
                    name: '展示用',
                    value: [2, 2, 2, 2, 2, 2],
                    symbol: 'rect',
                    symbolSize: 3,
                    itemStyle: {
                        normal: {
                            color: '#ffffff',
                        }
                    },
                    tooltip: {
                        show: false
                    },
                    lineStyle: {
                        normal: {
                            width: 3,
                            color: '#005CB3'
                        }
                    },
                    tooltip: {
                        show: false
                    }
                }

            ]
        }],
    };
    hexagonRadarEchart.setOption(hexagonRadarOption);
}
$(function () {
    initHealthyIndexGraph();
    initHexagonRadarGraph();
    window.addEventListener("resize", function () {
        healthyIndexEchart.resize();
        hexagonRadarEchart.resize();
    });
})