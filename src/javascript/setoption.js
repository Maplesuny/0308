import axios from 'axios'
import { useQuasar } from 'quasar'


export default function Setoption (){
    //-----for Loading timer------
    const $q = useQuasar()
    let timer

    function channel_name_function (arr, arr_length, data) {
        for (let i = 0; i < arr_length; i++) {
            arr.push(data[i]['id'])
        }
        return arr
    }

    // 資料與秒數合併 ==> arr[秒數,資料]
    function convert_sec (arr, start, end, idx, data, sumarr) {
        // 總筆數
        let total_number = end * 512
        //將筆數傳換為秒數，每筆幾秒
        let convert = end / total_number
        let conver_arr = []
        let sum = 0
        // console.log('data',data)
        // console.log('conver_sec', start, end)
        for (let i = 0; i < total_number; i++) {
            sum = sum + convert
            if (sum > start) {
                conver_arr.push([sum, data[idx]['value'][i]*5 - 500 * idx])
                // 將x軸時間儲存
                if (sumarr.length < total_number) {
                    sumarr.push(sum)
                }
            } else {
                // if start/end 10/40  , at least start > 10 ,then i will start count
                i = 0
            }
        }
        arr.push(conver_arr)
        // console.log('arr_length', arr[idx].length)
    }

    //dynamic_10sdata用
    function convert_sec2 (arr, start_time, end_time, idx, data, arrsum) {
        // 總筆數
        let total_number = end_time * 512
        // 將筆數換為秒數 
        let conver = end_time / total_number
        let conver_arr = []
        let sum = 0
        for (let i = 0; i < total_number; i++) {
            sum = sum + conver
            conver_arr.push([sum, data[idx]['value'][i]*5 - 500 * idx])
            if (arrsum.length < 5120) {
                arrsum.push(sum)
            }

        }
        // 要扣掉的筆數,
        let delete_number = start_time * 512
        // console.log(delete_number)
        if (delete_number === 0) {
            arr.push(conver_arr)
        } else {
            for (let j = 0; j < delete_number; j++) {
                // 從頭開始移除
                // conver_arr.shift()
                // 從後面移除
                conver_arr.pop()
            }
            arr.push(conver_arr)
        }
    }


    


    return {
        channel_name_function,convert_sec,convert_sec2
    }

}