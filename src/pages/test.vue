<template>
  <div>
    <div id="Echarts"></div>
    <q-btn @click="actiiion">ddfdsf</q-btn>
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
import setting_option from "../javascript/setoption";
import api from "../api/api_connect";
import axios from "axios";
import store from "../store/index";
import { daa, opp } from "../store/index";

export default {
  setup () {
    // 後端api的port
    let host = "127.0.0.1";
    let port = "8000";
    const start_time = ref(0);
    const end_time = ref(10);
    const montage_type = ref(1);
    const channel_array = ref([]);
    const default_color = ref("#3a3c42");
    let jump_to = ref(null);
    const page = ref(1);
    const Minpage = ref(1);
    // const Maxpage = ref(end_time.value / 10)
    const Maxpage = ref(10);
    // 控制dataZoom可以操控多個chanenl, format :[0,1,2,3....x]
    let count_channel = [];
    // get channel pre number
    const channel_number_arr = [];

    var myChart;

    const json_url =
      "http://" +
      host +
      ":" +
      port +
      "/api/v1/eegData?start_time=" +
      start_time.value +
      "&end_time=" +
      end_time.value +
      "&montage_type=" +
      montage_type.value;

    const position_url =
      "http://" + host + ":" + port + "/api/v1/get_position?page=" + page.value;


    const { axioss, getClientIP, dateString } = api();
    const {
      channel_name_function,
      convert_sec,
      convert_sec2,
      roundToTwo,
    } = setting_option("Echarts");

    function aaa () {
      alert("test");
    }

    function actiiion () {
      myChart.dispatchAction({
        type: "takeGlobalCursor",
        key: "brush",
        brushOption: {
          brushType: "rect",
          brushMode: "single",
        },
      });
    }

    async function setoption (url, start, end) {
      let series = [];
      const chartDom = document.getElementById("Echarts");
      let echarts_WH = {
        width: 1400 + "px",
        height: 670 + "px",
      };
      myChart = echarts.init(chartDom, null, echarts_WH);

      let data = await axioss(url);
      // Count Channel number [0,1,2,3,...16]
      for (let i = 0; i < Object.keys(data).length; i++) {
        count_channel.push(i);
      }
      channel_name_function(channel_array.value, data.length, data);

      // 將資料合併到save_arr ，format : [time,value]
      let save_arr = [];
      let sum_arr = [];
      for (let i = 0; i < data.length; i++) {
        convert_sec(save_arr, start, end, i, data, sum_arr);
      }

      // Markarea 內部的data
      let MarkArea_data = ref([]);
      MarkArea_data.value.push([
        {
          xAxis: 6.967840735068912,
          yAxis: -5510.000000000002,
          itemStyle: {
            borderWidth: 3,
            color: "rgba(245,39,56,0)",
            borderColor: "rgba(220,20,57,0.8)",
          },
          label: {
            show: true,
            position: "insideTopLeft",
            offset: [-1, -25],
            color: "black",
            fontStyle: "normal",
            fontSize: 20,
            rotate: 0,
            formatter: "1",
          },
        },
        {
          xAxis: 7.970903522205206,
          yAxis: -5025.833333333335, // 可依照實際的Y軸值
          itemStyle: {
            color: "",
          },
        },
      ]);

      let arr = ref([]);
      let count_ = 0;
      function cp_area (arr, xstart, ystart, xend, yend, number) {
        arr.push([
          {
            xAxis: xstart,
            yAxis: ystart,
            itemStyle: {
              borderWidth: 3,
              color: "rgba(245,39,56,0)",
              borderColor: "rgba(220,20,57,0.8)",
            },
            label: {
              show: true,
              position: "insideTopLeft",
              offset: [-1, -25],
              color: "black",
              fontStyle: "normal",
              fontSize: 20,
              rotate: 0,
              formatter: number,
            },
          },
          {
            xAxis: xend,
            yAxis: yend, // 可依照實際的Y軸值
            itemStyle: {
              color: "",
            },
          },
        ]);
      }

      function ss (arr) {
        arr.push([
          {
            xAxis: 6.70750382848392,
            yAxis: -4977.416666666668,
            itemStyle: {
              borderWidth: 3,
              color: "rgba(245,39,56,0)",
              borderColor: "rgba(220,20,57,0.8)",
            },
            label: {
              show: true,
              position: "insideTopLeft",
              offset: [-1, -25],
              color: "black",
              fontStyle: "normal",
              fontSize: 20,
              rotate: 0,
              formatter: "1",
            },
          },
          {
            xAxis: 7.28177641653905,
            yAxis: -4202.750000000001, // 可依照實際的Y軸值
            itemStyle: {
              color: "",
            },
          },
        ]);
      }

      // cp_area(arr.value)
      ss(arr.value);

      watch(arr, () => {
        console.log("cp_area", arr.value);
      });

      console.log("markarea", MarkArea_data.value);

      channel_array.value.forEach(function (eeg_parameter, idx) {
        let de = data.length - 1 - idx;
        let arr_split = channel_array.value[de].split("");
        for (let l = 0; l < 3; l++) {
          let conver_number = Number(arr_split[l]);
          if (!isNaN(conver_number)) {
            channel_number_arr.push(conver_number);
            if (conver_number % 2 === 0) {
              default_color.value = "#1607ed";
            } else if (conver_number % 2 != 0) {
              default_color.value = "#ed070f";
            }
          }
        }
        if (idx === 0) {
          default_color.value = "#0c0d0c";
        }
        if (arr_split[1] == "z") {
          default_color.value = "#0bb30b";
        }
        series.push({
          type: "line",
          name: eeg_parameter,
          data: save_arr[de],
          symbol: "none",
          smoth: true,
          color: default_color.value,
          markArea: {
            data: arr.value,
            // true: 框選區域無浮動淑標
            silent: true,
          },
        });
      });

      let aa = [];

      aa.push({
        markArea: {
          data: arr.value,
          // true: 框選區域無浮動淑標
          silent: true,
        },
      });

      // series.push({
      //     type: 'line',
      //     slient: true,
      //     data: series_data,
      //     color: 'black',
      //     markArea: {
      //         data: MarkArea_data
      //     }
      // })
      let option = {
        animation: false,
        xAxis: {
          type: "value",
          data: sum_arr,
          show: true,
          splitLine: {
            // 坐標軸分隔線
            show: true,
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
          min: start,
          max: end,
          interval: 1,
        },
        yAxis: {
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
          min: -100,
          max: 100,
        },
        series: series,
        grid: {
          left: "80px",
          right: "1%",
          containLabel: false,
        },
        dataZoom: [
          {
            type: "inside",
            xAxisIndex: count_channel,
            zoomOnMouseWheel: "alt",
          },
          {
            type: "slider",
            show: true,
          },
        ],
        toolbox: {
          feature: {
            dataZoom: {
              yAxisIndex: "none",
            },
          },
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
            borderColor: "rgba(220,20,57,0.8)",
          },
        },
      };
      myChart.setOption(option);

      let X_start = ref([]);
      let X_end = ref([]);
      let Y_start = ref([]);
      let Y_end = ref([]);
      let merge_object = ref([]);

      myChart.on("brushSelected", function (params) {
        let brushComponent = params.batch[0];
        if (brushComponent.areas[0] !== undefined) {
          let type = brushComponent.areas[0].brushType;
          console.log(brushComponent.areas[0]);

          // X 軸----------------------------------------
          let x_min_end = brushComponent.areas[0].range[0][0];
          let x_max_end = brushComponent.areas[0].range[0][1];
          console.log("loooook", brushComponent.areas[0]);
          console.log("x_min", x_min_end);
          console.log("x_max", x_max_end);

          // 再將rnage座標轉作為xy的座標(coordRange的值)
          X_end.value = myChart.convertFromPixel({ seriesIndex: 0 }, [
            x_max_end,
            x_min_end,
          ])[0];
          X_start.value = myChart.convertFromPixel({ seriesIndex: 0 }, [
            x_min_end,
            x_max_end,
          ])[0];

          console.log("coordRange_start", X_start.value);
          console.log("coordRange_end", X_end.value);
          //-----------------------------

          let y_min_end = brushComponent.areas[0].range[1][1];
          let y_max_end = brushComponent.areas[0].range[1][0];
          console.log("Y_min", y_min_end);
          console.log("Y_max", y_max_end);
          // convertToPixel
          // convertFromPixel
          Y_end.value = myChart.convertFromPixel({ seriesIndex: 0 }, [
            y_min_end,
            y_max_end,
          ])[1];
          Y_start.value = myChart.convertFromPixel({ seriesIndex: 0 }, [
            y_max_end,
            y_min_end,
          ])[1];
          console.log("Y_start", Y_start.value);
          console.log("Y_end", Y_end.value);
          // console.log('Y_max2', Y_end.value)

          let brush_number = params.batch[0].areas.length;

          console.log("實際框選數量: ", brush_number);

          // 計算框選的area數量
          let count_area = arr.value.length;

          ss(arr.value);
          console.log("框選數量", count_area);

          myChart.setOption(option);
        }
      });

      myChart.on("click", function (parameter) {
        console.log("click");
      });
    }
    onMounted(() => {
      setoption(json_url, start_time.value, end_time.value);
    });

    return {
      actiiion,
    };
  },
};
</script>
