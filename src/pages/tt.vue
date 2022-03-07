<template>
    <div>
        <div id="Echarts"></div>
    </div>
</template>

<script>
import * as echarts from "echarts";
import {
    ref,
    onMounted,
    watch,
    onBeforeUnmount,
    onBeforeMount,
    reactive,
    provide,
    computed,
} from "vue";
export default {
    setup () {
        var myChart;
        var option
        function setoption () {
            const chartDom = document.getElementById("Echarts");
            let echarts_WH = {
                width: 1400 + "px",
                height: 670 + "px",
            };
            myChart = echarts.init(chartDom, null, echarts_WH);

            option = {
                xAxis: {
                    // data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    type: "value",
                    show: true,
                    splitLine: {
                        // 坐標軸分隔線
                        show: false,
                        lineStyle: {
                            color: ["#626366"],
                            width: 0.5,
                            type: "solid",
                            join: "miter",
                        },
                    },
                    axisLabel: {
                        show: true,
                    },
                    min: 0,
                    max: 10,
                    interval: 1,

                    // axisTick: { alignWithLabel: true},
                },
                yAxis:
                {
                    show: true,
                    type: "value",
                    scale: true,
                    axisLabel: {
                        show: true,
                        showMinLabel: true,
                        showMaxLabel: true,
                    },
                    // 網格線
                    splitLine: {
                        show: true,
                    },
                    yAxisIndex: 0,
                    min: 0,
                    max: 10
                },

                series: [{
                    type: 'line',
                    silent: true,
                    data: [
                        // Y軸像上面那樣配置可以不用使用到data,底下的yAxis也可以依照實際的值寫
                        [1, 1],
                        [3, 0.5],
                    ],
                    color: 'black',
                    //, 182, 191, 234, 290, 330, 310],
                    markArea: {
                        data: [
                            [{
                                xAxis: 2,
                                yAxis: 1,
                                itemStyle: {
                                    borderWidth: 3,
                                    color: "rgba(245,39,56,0)",
                                    borderColor: "rgba(220,20,57,0.8)",
                                },
                                label: {
                                    show: true,
                                    position: "insideTopLeft",
                                    offset: [-1, -25],
                                    color: 'black',
                                    fontStyle: 'normal',
                                    fontSize: 20,
                                    rotate: 0,
                                    formatter: "1"
                                }

                            },
                            {
                                xAxis: 8,
                                yAxis: 2,  // 可依照實際的Y軸值
                                itemStyle: {
                                    color: ''

                                }

                            }],

                            // 第二個
                            [{
                                xAxis: 5.0267857142857135,
                                yAxis: 8.018518518518519,
                                itemStyle: {
                                    borderWidth: 3,
                                    color: "rgba(245,39,56,0)",
                                    borderColor: "rgba(0,0,0,0.8)",
                                },
                                label: {
                                    show: true,
                                    position: "insideTopLeft",
                                    offset: [-1, -25],
                                    color: 'black',
                                    fontStyle: 'normal',
                                    fontSize: 20,
                                    rotate: 0,
                                    formatter: "2"
                                }

                            },
                            {
                                xAxis: 5.7767857142857135,
                                yAxis: 9.981481481481481,  // 可依照實際的Y軸值
                                itemStyle: {
                                    color: ''

                                }

                            }],
                        ],
                    }
                }],
                toolbox: {
                    feature: {
                        dataZoom: {
                            yAxisIndex: "none",
                        },
                    }
                },
                brush: {
                    id: "brush",
                    geoIndex: "all",
                    seriesIndex: "all",
                    brushLink: "all",
                    toolbox: ["rect", "keep", "lineX", "clear"],
                    inBrush: {
                        opacity: 1,
                        symbolSize: 20,
                    },
                    // 調整是否可平移
                    transformable: false,
                    throttleType: "debounce",
                    throttleDelay: 600,
                    brushStyle: {
                        borderWidth: 3,
                        color: "rgba(245,39,56,0)",
                        borderColor: "rgba(0,0,0,1)",
                    },

                }

            };

            myChart.setOption(option);


            let X_start = ref([])
            let X_end = ref([])
            let Y_start = ref([])
            let Y_end = ref([])
            myChart.on("brushSelected", function (params) {
                let brushComponent = params.batch[0];
                if (brushComponent.areas[0] !== undefined) {
                    let type = brushComponent.areas[0].brushType;
                    console.log(brushComponent.areas[0])

                    // X 軸----------------------------------------
                    let x_min_end = brushComponent.areas[0].range[0][0];
                    let x_max_end = brushComponent.areas[0].range[0][1];
                    console.log('loooook', brushComponent.areas[0])
                    console.log('x_min', x_min_end)
                    console.log('x_max', x_max_end)

                    // 再將rnage座標轉作為xy的座標(coordRange的值)
                    X_end.value = myChart.convertFromPixel({ seriesIndex: 0 }, [
                        x_max_end,
                        x_min_end,
                    ])[0];
                    X_start.value = myChart.convertFromPixel({ seriesIndex: 0 }, [
                        x_min_end,
                        x_max_end,
                    ])[0];

                    console.log('coordRange_start', X_start.value)
                    console.log('coordRange_start', X_end.value)
                    //-----------------------------

                    let y_min_end = brushComponent.areas[0].range[1][1];
                    let y_max_end = brushComponent.areas[0].range[1][0];
                    console.log('Y_min', y_min_end)
                    console.log('Y_max', y_max_end)
                    // convertToPixel
                    // convertFromPixel
                    Y_end.value = myChart.convertFromPixel({ seriesIndex: 0 }, [
                        y_min_end,
                        y_max_end,

                    ])[1];
                    Y_start.value = myChart.convertFromPixel({ seriesIndex: 0 }, [

                        y_max_end,
                        y_min_end
                    ])[1];
                    console.log('Y_start', Y_start.value)
                    console.log('Y_end', Y_end.value)
                    // console.log('Y_max2', Y_end.value)


                }
            })

        }
        onMounted(() => {
            setoption();
        });

    },
}
</script>