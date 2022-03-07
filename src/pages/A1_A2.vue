<template>
  <div class="q-pa-md q-gutter-sm">
    <q-breadcrumbs>
      <q-breadcrumbs-el :label="montage_type_convert[montage_type]" />
      <q-breadcrumbs-el label="Components" />
      <q-breadcrumbs-el :label="PatientID" />
    </q-breadcrumbs>
  </div>
  <div style="position: relative" class="fit column">
    <div style="display: flex; width: 1450px">
      <div id="chartDiv" style="height: 100%; width: calc(100% - 450px)">
        <div>
          <div id="Echarts"></div>
        </div>
        <canvas id="canvas" style="position: absolute; top: 80px; left: 5px"></canvas>
        <canvas id="canvas2" style="position: absolute;top: 50px;left: 10px;z-index: -1;"></canvas>
        <div class="flex flex-center items-center">
          <!-- q-pb-lg  -->
          <q-btn @click="pre_button" v-bind:disabled="page <= Minpage">上一頁</q-btn>
          <span class="q-ml-md">第 {{ page }} 頁 / 共 {{ Maxpage }}頁</span>
          <q-btn @click="next_button" v-bind:disabled="page >= Maxpage" class="q-ml-md">下一頁</q-btn>
          <span class="q-ml-md">跳至</span>
          <q-input
            outlined
            v-model="jump_to"
            class="pagination-input"
            placeholder="請輸入頁數"
            mask="##"
            @keyup.enter="send_page"
          ></q-input>
          <span class="q-ml-md">頁</span>
          <q-btn @click="send_page" class="q-ml-md" v-bind:disable="jump_to > Maxpage">送出</q-btn>
          <span class="q-ml-md" style="text-align: center"></span>
          <span class="q-ml-md" style="font-size: 18px">
            Model Pred_result is :
            <q-badge
              color="white"
              style="font-size: 25px"
              align="middle"
              :text-color="show_result_color"
            >{{ show_result }}</q-badge>
          </span>
          <br />
          <span>
            <q-btn round @click="getRandomData">
              <q-avatar size="42px">
                <img src="https://img.icons8.com/color/32/000000/microsoft-excel-2019--v1.png" />
              </q-avatar>
            </q-btn>
          </span>

          <!-- <q-btn @click="send_page" v-else disable class="q-ml-md">送出</q-btn> -->
        </div>
      </div>
    </div>
    <subTODO
      :current_page="page"
      :insert_url="insert_db_url"
      :input_text="send_message"
      :montage_type="montage_type_convert[montage_type]"
    ></subTODO>
    <q-btn @click="dynamic_10sdata">確認</q-btn>
  </div>
</template>

<script>
import {
  ref,
  onMounted,
  watch,
  onBeforeUnmount,
  onBeforeMount,
  reactive,
  provide,
  computed,
  inject,
} from "vue";
import api from "../api/api_connect";
import * as echarts from "echarts";
import optionJS from "../javascript/setoption";
import store from "../store/index";
import axios from "axios";
import subTODO from "../components/TODO.vue";
import dialogs from "../components/dialog.vue";
export default {
  components: {
    subTODO,
  },
  setup () {
    const { host, port, axioss, getClientIP, dateString } = api();
    const { channel_name_function, convert_sec, convert_sec2 } = optionJS();
    const start_time = ref(0);
    const end_time = ref(10);
    const montage_type = ref(0);
    const channel_array = ref([]);
    const Client_ip = ref("");
    const PatientID = ref('')
    // 要傳出去的值 (原sec_range)
    const send_message = ref("");
    const db_insert_url = ref("");
    let channel_object = ref([]);
    // 控制dataZoom可以操控多個chanenl, format :[0,1,2,3....x]
    let count_channel = [];
    const default_color = ref("#3a3c42");
    // get channel pre number
    const channel_number_arr = [];
    const page = ref(1);
    const Minpage = ref(1);
    // model result
    const model_result = ref([]);
    const model_reslut_length = ref(0);
    let model_num = ref(0);
    let show_result = ref("");
    const show_result_color = ref("");
    // 框選數量有幾個
    let brush_count = ref(0);
    // 至多兩個，用來比對前後兩值是否相同
    let compare_two = [];
    // 儲存時間
    let save_cor_time = [];
    var rangeArray = [[]];
    let brush_ares0 = ref([]);
    // 要送給DB的值  因為有range0 range1
    var x_min_end; // range_start
    var x_max_end; // range_end
    var y_max_end; // range_start1
    var y_min_end; // range_end1
    var X_start = ref([]);
    var X_end = ref([]);
    var Y_start = ref([]);
    var Y_end = ref([]);
    //---------------
    let send_x_start = ref(0);
    let send_x_end = ref(0);
    //---------------

    // const Maxpage = ref(end_time.value / 10)
    const Maxpage = ref(10);
    let jump_to = ref(null);
    var myChart;
    const json_url = ref("");
    const insert_db_url = ref("");
    const delete_url = ref("");
    let grid = ref([]);
    let toolbox = ref([]);
    let brush = ref([]);
    var montage_type_convert = {
      0: "A1_A2",
      1: "CZ",
      2: "Double_Banana",
    };
    json_url.value =
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
    const time_url = "http://" + host + ":" + port + "/api/v1/Time_Information";
    const model_result_url =
      "http://" + host + ":" + port + "/api/v1/pre_result";
    // get 最大秒數
    async function SecTopage (url) {
      let api_time = await axioss(url);
      console.log("api_time", api_time);
      let second = Math.ceil(api_time[1] / 10); // ceil 無條件進入
      Maxpage.value = second;
    }
    // get model result  一開始的預測model
    async function Modelresult (url) {
      model_result.value = await axioss(url);
      // show_result會根據 modelnum來決定顯示第幾個30秒
      show_result.value = model_result.value[0];
      console.log('Model的預測結果', model_result.value)
      model_reslut_length.value = model_result.value.length;
    }
    // 預測模型的數字
    function pre_list_num (self_page) {
      // 預測模型list後面數字
      let prenum = (self_page * 10) / 30;
      if ((self_page * 10) % 30 === 0) {
        prenum = prenum - 1;
      }
      model_num.value = Math.floor(prenum);
      show_result.value = model_result.value[model_num.value];
      // console.log("show_result", [model_num.value], show_result.value);
    }
    // 上一頁
    function pre_button () {
      page.value--;
      dynamic_10sdata();
      clear();
      console.log("目前頁數: ", page.value, '目前秒數 :', page.value * 10);
      pre_list_num(page.value);
      store.dispatch(
        "GET_TODO",
        page.value,
        montage_type_convert[montage_type.value]
      );
      // 清空
      // send_message.value = ''
    }
    //下一頁
    function next_button () {
      page.value++;
      dynamic_10sdata();
      clear();
      console.log("下一頁的brush0", brush_ares0.value);
      console.log("目前頁數: ", page.value);
      console.log("目前秒數", page.value * 10);
      pre_list_num(page.value);
      store.dispatch(
        "GET_TODO",
        page.value,
        montage_type_convert[montage_type.value]
      );
      // send_message.value = ''
    }
    // jump_to送出
    function send_page () {
      // console.log(jump_to.value)
      if (jump_to.value != 0) {
        page.value = Number(jump_to.value);
        // dynamic_10sdata('next')
        if (isNaN(Number(jump_to.value))) {
          // 非數字
          alert("Please check input, Input type is [Number]");
        } else if (Number(jump_to.value) > Maxpage.value) {
          // 大於最大頁數
          alert(
            "Your page greater than " + Maxpage.value + " ,Please ctry again"
          );
        } else if (Number(jump_to.value) < 1) {
          alert("Page number is not found , Please try again");
          page.value = 1;
          dynamic_10sdata();
          //dynamic_10sdata(page.value, montage_type.value);
        } else {
          dynamic_10sdata();
          //dynamic_10sdata(page.value, montage_type.value);
          pre_list_num(page.value);
          store.dispatch(
            "GET_TODO",
            page.value,
            montage_type_convert[montage_type.value]
          );
        }
      } else {
        alert(
          "Page number " +
          "'" +
          jump_to.value +
          "'" +
          "  is not found , Please try again!"
        );
      }
    }
    //---------------------- Echarts Action -----------------------
    function clear () {
      myChart.dispatchAction({
        type: "brush",
        areas: [],
      });
    }
    // ----------------------DB 操作-------------------------------
    function delete_db_url (page, montage) {
      delete_url.value = `http://${host}:${port}/api/v1/delete?page=${page}&montage=${montage_type_convert[montage_type.value]
        }`;
      console.log("delete", delete_url.value);
      Promise.all([axios.post(delete_url.value)]).then(() => {
        store.dispatch("GET_POSITION", page, montage);
        store.dispatch("GET_TODO", page, montage); // 要get_position才會更新框選的值
        clear();
        dynamic_10sdata();
      });
    }
    // 比較固定的option
    function base_option () {
      grid.value.push({
        left: "80px",
        right: "1%",
        containLabel: false,
      });
      toolbox.value.push({
        feature: {
          dataZoom: {
            yAxisIndex: "none",
          },
          saveAsImage: {},
          mytools1: {
            show: true,
            title: "delete",
            icon: "M14 31.998h36;M28 18L14 32l14 14",
            // icon: sharpSignalCellularAlt,
            onclick: function () {
              //   let brush_last_index = brush_ares0.value.length - 1;
              //   console.log("onclick", brush_ares0.value[brush_last_index]);
              delete_db_url(
                page.value,
                montage_type_convert[montage_type.value]
              );
              // brush_ares0.value.pop();
            },
          },
          mytools2: {
            show: true,
            title: "restore",
            // icon: 'M 0 0 M 0 -1 L 2 1 M 2 0 M 0 -1 L 0 1 M 1 1 L 2 1 L 0 1 L 0 1 M 0 1 L 2 -1 M 2 1 L 2 1 M 2 1 L 2 1 L 2 0 L 2 -1 M 2 -1 L 2 -1 M 2 -1 L 2 -1 M 2 -1 L 1 -1 M 1 -1 L 0 -1',
            icon: "M10.168 34.947a26.016 26.016 0 1 1 7.45 15.432;M2 23l8.168 11.947L20.986 25",
            // icon: sharpSignalCellularAlt,
            onclick: function () {
              myChart.dispatchAction({
                type: "restore",
              });
              page.value = Minpage.value;
              jump_to.value = null;
              show_result.value = model_result.value[0];
              store.dispatch(
                "GET_TODO",
                page.value,
                montage_type_convert[montage_type.value]
              );
              store.dispatch(
                "GET_POSITION",
                page.value,
                montage_type_convert[montage_type.value]
              );
              dynamic_10sdata();
              // setoption()
            },
          },
          mytools3: {
            show: true,
            title: "rect",
            icon: "image://data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' class='icon icon-tabler icon-tabler-rectangle' width='24' height='24' viewBox='0 0 24 24' stroke-width='1.25' stroke='currentColor' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath stroke='none' d='M0 0h24v24H0z' fill='none'/%3E%3Crect x='3' y='5' width='18' height='14' rx='2' /%3E%3C/svg%3E",
            onclick: function () {
              // clear()
              myChart.dispatchAction({
                type: "takeGlobalCursor",
                key: "brush",
                brushOption: {
                  brushType: "rect",
                  brushMode: "multiple",
                },
              });
            },
          },
          // mytools4: {
          //     show: true,
          //     title: "橫向選擇",
          //     icon: "image://data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' class='icon icon-tabler icon-tabler-code-plus' width='64' height='64' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath stroke='none' d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M9 12h6' /%3E%3Cpath d='M12 9v6' /%3E%3Cpath d='M6 19a2 2 0 0 1 -2 -2v-4l-1 -1l1 -1v-4a2 2 0 0 1 2 -2' /%3E%3Cpath d='M18 19a2 2 0 0 0 2 -2v-4l1 -1l-1 -1v-4a2 2 0 0 0 -2 -2' /%3E%3C/svg%3E",
          //     onclick: function () {
          //         // clear()
          //         myChart.dispatchAction({
          //             type: "takeGlobalCursor",
          //             key: "brush",
          //             brushOption: {
          //                 brushType: "lineX",
          //                 brushMode: "multiple",
          //             },
          //         });
          //     },
          // },
          mytools5: {
            show: true,
            title: "clear",
            icon: "image://data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' class='icon icon-tabler icon-tabler-square-off' width='64' height='64' viewBox='0 0 24 24' stroke-width='1.25' stroke='currentColor' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath stroke='none' d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M8 4h10a2 2 0 0 1 2 2v10m-.584 3.412a1.994 1.994 0 0 1 -1.416 .588h-12a2 2 0 0 1 -2 -2v-12c0 -.552 .224 -1.052 .586 -1.414' /%3E%3Cpath d='M3 3l18 18' /%3E%3C/svg%3E",
            onclick: function () {
              clear();
              store.dispatch(
                "GET_TODO",
                page.value,
                montage_type_convert[montage_type.value]
              );
            },
          },
        },
      });
      brush.value.push({
        id: "brush",
        geoIndex: "all",
        seriesIndex: "all",
        brushLink: "all",
        toolbox: toolbox,
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
      });
    }
    async function dynamic_10sdata () {
      store.dispatch("GET_POSITION", page.value);
      let position = computed(() => store.getters["getter_position"]);
      console.log("position,,", position.value);
      let dynamic_start = page.value * 10 - 10;
      let dynamic_end = page.value * 10;
      console.log(
        "dynamic 秒數: ",
        dynamic_start,
        dynamic_end + " 頁數: ",
        page.value
      );
      let url =
        "http://" +
        host +
        ":" +
        port +
        "/api/v1/eegData?start_time=" +
        dynamic_start +
        "&end_time=" +
        dynamic_end +
        "&montage_type=" +
        montage_type.value;
      // store.dispatch("GET_TODO");
      let series1 = [];
      let Data = await axioss(url);
      console.log("DDData", Data);
      // 將資料合併到save_arr ，format : [time,value]  value只有10秒資料
      let all_save_arr = [];
      let ttest = [];
      for (let i = 0; i < Data.length; i++) {
        // convert_sec(all_save_arr, dynamic_start, dynamic_end, i, Data);
        convert_sec2(all_save_arr, dynamic_start, dynamic_end, i, Data, ttest);
      }
      console.log("all_save_arr", all_save_arr);
      // sum_sec_list(ttest, dynamic_start, dynamic_end)
      // console.log("ttest", ttest);
      let next_page_value = 0;
      channel_array.value.forEach(function (egg_parameter, idx) {
        let de = Data.length - 1 - idx;
        // console.log('Daa', all_save_arr[de])
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
        series1.push({
          type: "line",
          name: egg_parameter,
          data: all_save_arr[de],
          symbol: "none",
          smoth: true,
          color: default_color.value,
          markArea: {
            data: position.value,
            // true: 框選區域無浮動淑標
            silent: true,
          },
        });
      });
      let option = {
        animation: false,
        xAxis: {
          type: "value",
          show: true,
          data: ttest,
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
            formatter: function (value) {
              // 從start time抓開頭，從開頭+value
              next_page_value = dynamic_start + value;
              return next_page_value;
            },
            show: true,
          },
          min: 0,
          max: 10,
          interval: 1,
        },
        yAxis: {
          show: false,
          type: "value",
          scale: true,
          axisLabel: {
            show: true,
            showMinLabel: true,
            showMaxLabel: true,
          },
          // 網格線
          splitLine: {
            show: false,
          },
          min: 495 * (-1 * Data.length),
          max: 300,
        },
        series: series1,
        grid: grid,
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
        toolbox: toolbox,
        brush: brush,
      };
      // myChart.clear()
      myChart.setOption(option);
    }
    async function setoption () {
      let arr = ref([]);
      let series = [];
      const chartDom = document.getElementById("Echarts");
      let echarts_WH = {
        width: 1400 + "px",
        height: 670 + "px",
      };
      myChart = echarts.init(chartDom, null, echarts_WH);
      let data = await axioss(json_url.value);

      // for(let j =0 ;j<data.length;j++){
      //   data = data[0]*2
      // }
      // IP
      Client_ip.value = await getClientIP();
      // Count Channel number [0,1,2,3,...16]
      for (let i = 0; i < Object.keys(data).length; i++) {
        count_channel.push(i);
      }
      channel_name_function(channel_array.value, data.length, data);
      // 將資料合併到save_arr ，format : [time,value]
      let save_arr = [];
      let sum_arr = [];
      for (let i = 0; i < data.length; i++) {
        convert_sec(
          save_arr,
          start_time.value,
          end_time.value,
          i,
          data,
          sum_arr
        );
      }

      let positon = computed(() => store.getters["getter_position"]);
      // console.log("positonpositon", positon.value);
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
            data: positon.value,
            // true: 框選區域無浮動淑標
            silent: true,
          },
        });
      });
      base_option();
      let option = {
        animation: false,
        xAxis: {
          type: "value",
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
          min: start_time.value,
          max: end_time.value,
          interval: 1,
        },
        yAxis: {
          show: false,
          type: "value",
          scale: true,
          axisLabel: {
            show: true,
            showMinLabel: true,
            showMaxLabel: true,
          },
          // 網格線
          splitLine: {
            show: false,
          },
          min: 495 * (-1 * data.length),
          max: 300,
        },
        series: series,
        grid: grid.value,
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
        toolbox: toolbox.value,
        brush: brush.value,
      };
      myChart.setOption(option);


      // canvas
      var canvas = document.getElementById("canvas");
      canvas.width = 75;
      canvas.height = 700;
      var ctx = canvas.getContext("2d");
      ctx.font = "15px serif";
      channel_array.value.forEach(function (channel_name, idx) {
        // console.log(channel_name)
        //8.35   越大整體越縮小
        ctx.fillText(channel_name, 10, (idx * 295) / 9.5 + 10);
      });

      // canvas2
      var canvas2 = document.getElementById("canvas2")
      canvas2.width = 1450
      canvas2.height = 600
      var I = canvas2.getContext('2d')
      I.beginPath()
      I.lineWidth = 3
      I.strokeStyle = "#2d14e3"
      I.fillStyle = "#2d3e6e"
      /*使用rect(x,y,w,h)繪製四角形
      x,y一樣是座標，w和h是四邊形的寬和高*/
      I.rect(1390, 15, 10, 26);
      I.fill()
      I.stroke()
      I.font = '15px self'
      I.fillText('100uv', 1380, 57)




      // 做成check 給Dialog
      channel_array.value.forEach(function (parameter, idx) {
        channel_object.value.push({
          id: idx,
          title: parameter,
          done: false,
        });
      });
      myChart.on("brushSelected", function (params) {
        let brushComponent = params.batch[0];
        if (brushComponent.areas[0] !== undefined) {
          let type = brushComponent.areas[0].brushType;
          console.log(brushComponent.areas[0]);
          console.log("aaaatype", type);
          brush_count.value = params.batch[0].areas.length;
          console.log("looooook", brushComponent.areas[0]);
          // 框選數量
          let brush_number = params.batch[0].areas.length;
          // console.log("框選數量", brush_number);
          // console.log('params.batch[0]', params.batch[0]);
          //裡面有三筆的話，areas_length -1移除前兩筆(最後一筆不算) (Queue FIFO)，不移除的話每次框都會疊加0,1,2,3...
          for (let i = 0; i < brush_count.value - 1; i++) {
            // console.log(params.batch[0].areas[i])
            params.batch[0].areas.shift();
          }
          // 框起來的值，後面比對用
          let select_value = brushComponent.areas[0].range[0][0];
          // 儲存所框選的座標
          brush_ares0.value.push([
            params.batch[0].areas[0].range[0],
            params.batch[0].areas[0].range[1],
          ]);
          // single brush時要確定是否同一行為(比較所框選的值)
          if (compare_two.length < 2) {
            compare_two.push(select_value);
          } else {
            compare_two.shift();
            compare_two.push(select_value);
          }
          if (compare_two[0] != compare_two[1] && brush_number === 1) {
            if (brush_ares0.value.length > 1) {
              // console.log('comparte兩個值不相等且框選1個')
              // console.log("移除brush0", brush_ares0.value[0]);
              brush_ares0.value.shift();
              // http://127.0.0.1:8000/api/v1/delete_predata
              // axios.post("http://127.0.0.1:" + port + "/api/v1/delete_predata");
            }
          }
          // X 軸----------------------------------------
          x_min_end = brushComponent.areas[0].range[0][0]; // range_start
          x_max_end = brushComponent.areas[0].range[0][1]; // range_end
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

          // 對於要顯示的必須額外宣告，不然會畫不出來，因為只有0-10，其餘顯示是加上去的

          if (page.value != 1) {
            send_x_start.value = X_start.value + 10 * (page.value - 1);
            send_x_end.value = X_end.value + 10 * (page.value - 1);
          } else {
            send_x_start.value = X_start.value;
            send_x_end.value = X_end.value;
          }
          console.log("send_x_start", send_x_start.value);
          // 取小數第二位
          let send_start = +(Math.round(send_x_start.value + "e+2") + "e-2");
          let send_end = +(Math.round(send_x_end.value + "e+2") + "e-2");
          send_message.value =
            "StartTime: " + send_start + " sec , EndTime: " + send_end + " sec";
          console.log(send_message.value);
          //-----------------------------
          y_min_end = brushComponent.areas[0].range[1][1]; //range_end1
          y_max_end = brushComponent.areas[0].range[1][0]; // range_start1
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
          insert_db_url.value = `http://${host}:${port}/api/v1/insert?page=${page.value
            }&starttime=${X_start.value}&y_start_value=${Y_start.value}&endtime=${X_end.value
            }&y_end_value=${Y_end.value}&title='${send_message.value
            }'&range_start=${x_min_end}&range_end=${x_max_end}&range_start1=${y_max_end}&range_end1=${y_min_end}&montage_type=${montage_type_convert[montage_type.value]
            }&ip=${Client_ip.value}`;
          console.log("實際框選數量: ", brush_number);
          // 計算框選的area數量
          let count_area = arr.value.length;
          console.log("框選數量", count_area);
        }
      });
    }

    //隨機產生資料，匯出CSV
    async function getRandomData () {
      let info_url = `http://${host}:${port}/api/v1/get_info?montage=${montage_type_convert[montage_type.value]
        }`;
      let kkdata = await axioss(info_url);
      let total_number = kkdata[0].length;
      var header =
        "PatientID,Events1,Events2,Events3,StartTime,Dutation,Montage_Type,Channel,File_path\n";
      var data = "";
      for (var i = 0; i < total_number; i++) {
        // debugger;
        let kk_patientID = kkdata[1];
        let kk_events = kkdata[0][i]["events"];
        let kk_starttime = kkdata[0][i]["start"];
        let kk_page = kkdata[0][i]["page"];
        let kk_endtime = kkdata[0][i]["end"];
        let kk_montage = kkdata[0][i]["montage"];
        let kk_channel = kkdata[0][i]["channel"];
        // let channel_toStr = kk_channel.toString();
        let kk_path = kkdata[2];

        // 從event裡面先找出 "/"的index在哪，並儲存
        // 最好的辦法是改DB
        let save_dot_list = []
        for (let j = 0; j < kkdata[0][i]['events'].length; j++) {
          let words = kkdata[0][i]['events'][j]
          if (words == '/') {
            console.log('出現/出現在index:', j)
            save_dot_list.push(j)
          }
        }


        console.log('dotlist', save_dot_list)
        let event_word1 = kkdata[0][i]['events'].substring(0, save_dot_list[0])
        let event_word2 = kkdata[0][i]['events'].substring(save_dot_list[0] + 1, save_dot_list[1])
        let event_word3 = kkdata[0][i]['events'].substring(save_dot_list[1] + 1, kkdata[0][i]['events'].length)
        console.log('ssss', event_word1)
        console.log('ssss2', event_word2)
        console.log('ssss3', event_word3)

        if (kk_page != 1) {
          kk_starttime = kk_starttime + 10 * (kk_page - 1);
          kk_endtime = kk_endtime + 10 * (kk_page - 1);
        }

        // 計算end-start
        let dutation = kk_endtime - kk_starttime;
        // dutation = +(Math.round(dutation + "e+2") + "e-2");

        for (var j = 0; j < 9; j++) {
          if (j > 0) {
            data = data + ",";
          }
          if (j == 0) {
            data = data + kk_patientID;
          }
          if (j == 1) {
            data = data + event_word1;
          }
          if (j == 2) {
            data = data + event_word2;
          }
          if (j == 3) {
            data = data + event_word3;
          }
          if (j == 4) {
            data = data + kk_starttime;
          }
          if (j == 5) {
            data = data + dutation;
          }
          if (j == 6) {
            data = data + kk_montage;
          }
          if (j == 7) {
            data = data + `"${kk_channel}"`;
          }
          if (j == 8) {
            data = data + kk_path;
          }
        }
        data = data + "\n";
      }

      console.log(header + data);
      // return header + data;

      var fileName =
        montage_type_convert[montage_type.value] + "_Output" + ".csv"; //匯出的檔名
      // var data = getRandomData();
      var blob = new Blob(["\uFEFF" + (header + data)], {
        type: "application/octet-stream",
      });
      var href = URL.createObjectURL(blob);
      var link = document.createElement("a");
      document.body.appendChild(link);
      link.href = href;
      link.download = fileName;
      link.click();
    }

    async function getPatientID () {
      let info_url = `http://${host}:${port}/api/v1/get_info?montage=${montage_type_convert[montage_type.value]
        }`;
      let kkdata = await axioss(info_url);
      PatientID.value = kkdata[1]
    }

    watch(show_result, () => {
      // console.log("watch show_result", show_result.value);
      if (show_result.value == "Seizure") {
        show_result_color.value = "red";
      } else {
        show_result_color.value = "blue-14";
      }
    });

    // 改變vuex 的montage值
    store.dispatch("SET_montage", montage_type_convert[montage_type.value]);
    const get_vuex_montage = computed(() => store.getters["getter_montage"]);
    console.log("改變了vuex的montage值", get_vuex_montage.value);

    // 傳到孫dialog
    provide("channel_object", channel_object.value);
    provide("mmontage_type", montage_type_convert[montage_type.value]);

    onBeforeMount(() => {
      SecTopage(time_url);
      Modelresult(model_result_url);
      store.dispatch(
        "GET_POSITION",
        page.value,
        montage_type_convert[montage_type.value]
      );

      getPatientID()
    });
    onMounted(() => {
      setoption();
    });
    return {
      montage_type,
      montage_type_convert,
      Minpage,
      Maxpage,
      page,
      jump_to,
      send_message,
      pre_button,
      next_button,
      send_page,
      show_result,
      show_result_color,
      insert_db_url,
      delete_url,
      dynamic_10sdata,
      delete_db_url,
      getRandomData,
      PatientID
    };
  },
};
</script>
