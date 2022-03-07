import axios from "axios";
import { computed } from "vue";

export default function set_api() {
  // const host = '10.65.51.164'
  // const port = '1082'
  const host = "127.0.0.1";
  const port = "8000";
  // 連接axios
  async function axioss(url) {
    return await axios
      .get(url)
      .then((res) => {
        let data = res.data;
        return data;
      })
      .catch((err) => {
        console.log("axioss 連線失敗, err: ", err);
        alert("連線失敗", err);
      });
  }

  // GET  IP
  async function getClientIP() {
    return await axios.get("https://ipapi.co/json/").then((res) => {
      return res.data["ip"];
    });
  }

  function todoDay() {
    const date = new Date();
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.getDay()];
  }
  const day = todoDay();
  const date = new Date().getDate();
  const year = new Date().getFullYear();
  // 當天日期
  const dateString = computed(() => {
    return `${date} ${day} ${year}`;
  });

  // 將日期轉換格式成 2022-02-16 15:44:56
  Date.prototype.Format = function (fmt) {
    var o = {
      "M+": this.getMonth() + 1, //月份
      "d+": this.getDate(), //日
      "H+": this.getHours(), //小時
      "m+": this.getMinutes(), //分
      "s+": this.getSeconds(), //秒
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度
      S: this.getMilliseconds(), //毫秒
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length)
      );
    }
    for (var k in o) {
      if (new RegExp("(" + k + ")").test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length == 1
            ? o[k]
            : ("00" + o[k]).substr(("" + o[k]).length)
        );
      }
    }
    return fmt;
  };

  function convertStrToDate(dateStr) {
    let ary = dateStr.split(" ");
    let d = ary[0].split("-");
    let t = ary[1].split(":");
    return new Date(d[0], d[1] - 1, d[2], t[0], t[1], t[2]);
  }

  function dateDiff(start, end) {
    const leftPad = (num) => (num > 9 ? num : "0" + num);
    let diffMs = end - start; // 取得兩日期相差的毫秒數
    let diffDays = Math.floor(diffMs / 86400000); // 取得天數
    let diffHrs = Math.floor((diffMs % 86400000) / 3600000); // 取得小時數
    let diffMins = Math.floor(((diffMs % 86400000) % 3600000) / 60000); // 取得分鐘數
    let diffSecs = Math.floor((((diffMs % 86400000) % 3600000) % 60000) / 1000); // 取得秒數
    return leftPad(diffHrs) + ":" + leftPad(diffMins) + ":" + leftPad(diffSecs);
  }

  // 使用以下就可以計算出兩者的時間差
  // let startTime = convertStrToDate("2019-08-21 15:30:00");
  // let endTime = convertStrToDate("2019-08-23 16:55:05");
  // let result = dateDiff(startTime, endTime)
  // console.log(result)

  return {
    getClientIP,
    axioss,
    host,
    port,
    dateString,
  };
}
