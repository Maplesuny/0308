import { store } from "quasar/wrappers";
import { createStore } from "vuex";
import axios from "axios";
import { ref } from "vue";
import api from "../api/api_connect";

let tTODOS = ref([]);
let position = ref([]);
// 判斷是否為abnormal
var judge_normal 
const { host, port, axioss } = api();
export default createStore({
  state: {
    Todos: tTODOS,
    Position: position,
    montage:'CC'
  },
  actions: {
    GET_TODO(context, current_page = 1) {
      let get_vuex_montage = context.getters['getter_montage']
      // console.log('GETTODOXXX',get_vuex_montage)
      let url = `http://${host}:${port}/api/v1/get_Todolist?pages=${current_page}&montage_type=${get_vuex_montage}`
      // 預設一開始頁數都是1，
      axios
        .get(url)
        .then((res) => {
          context.commit("getTodo", res.data);
        });
    },
    GET_POSITION(context, current_page = 1) {
      let get_vuex_montage = context.getters['getter_montage']
      // 預設一開始頁數都是1，
      axios
        .get(`http://${host}:${port}/api/v1/get_Todolist?pages=${current_page}&montage_type=${get_vuex_montage}`)
        .then((res) => {
          context.commit("get_position", res.data);
        });
    },
    SET_montage(context,status){
      context.commit('TEST',status)
    }
  },
  mutations: {
    TEST(state,status){
      state.montage = status
    },

    getTodo(state, payload) {
      // console.log("mutations");
      // console.log('payload',payload)
      tTODOS.value.splice(0, tTODOS.value.length);
      for (let i = 0; i < payload.length; i++) {
        // console.log('所選取的event路徑',payload[i]['events'])
        let value = payload[i]['events']
        // 判斷是否abnormal
        judge_normal = /abnormal/.test(payload[i]['events'])
        
        // 一開始的狀態沒有賦予normal ，型態是object，要先判斷
        if (typeof(value)=='string'){
            if (judge_normal==true){
              // 如果是true，表示為abnormal
              // console.log(value.substr(0,8))
              payload[i]['events'] = value.substr(0,8)
            }else{
              // console.log(value.substr(0,6))
               payload[i]['events'] = value.substr(0,6)
            }
        }
        tTODOS.value.push(payload[i]);
      }
    },
    get_position(state, payload) {
      // console.log("get_position", payload);
      position.value.splice(0, position.value.length);
      for (let i = 0; i < payload.length; i++) {
        position.value.push([
          {
            xAxis: payload[i]["start"],
            yAxis: payload[i]["y_start"],
            itemStyle: {
              borderWidth: 3,
              color: "rgba(245,39,56,0)",
              borderColor: "rgba(0,0,0,0.8)",
            },
            label: {
              show: true,
              position: "insideTopLeft",
              offset: [-1, -25],
              color: "black",
              fontStyle: "normal",
              fontSize: 20,
              rotate: 0,
              formatter: payload[i]["id"].toString(),
            },
          },
          {
            xAxis: payload[i]["end"],
            yAxis: payload[i]["y_end"], // 可依照實際的Y軸值
            itemStyle: {
              color: "",
            },
          },
        ]);
      }
    },
  },
  getters: {
    getter_todo(state) {
      return state.Todos;
    },
    getter_position(state) {
      return state.Position;
    },
    getter_montage(state){
      return state.montage
    }
  },
});
