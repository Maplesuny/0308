<template>
  <q-scroll-area style="top: 1px; height: 85%; width: 450px">
    <q-list bordered separator style="max-width: 450px">
      <q-item-label header style="font-size: 20px; text-align: center">Label TODOS</q-item-label>
      <br />
      <q-toggle
        :label="hint(todos.length)"
        color="blue-13"
        v-model="chooseModel"
        @click="choose(chooseModel, montage_type)"
      />
      <br />
      <q-item-label caption lines="1" style="font-size: 17px; text-align: center">{{ current_time }}</q-item-label>
      <!--底下開始TODO-->
      <q-item v-for="todo in todos" :key="todo.id">
        <q-item-section avatar top>
          <!-- <q-icon name="account_tree" color="black" size="34px" /> -->
          <q-checkbox v-model="todo.done"></q-checkbox>
        </q-item-section>

        <q-item-section>
          <q-item-label lines="5">
            <div class="q-pa-md q-gutter-md">
              <span class="text-weight-medium">{{ todo.id }} .</span>
              <q-badge outline v-if="todo.events == 'normal'" color="blue-14">
                {{
                  todo.events
                }}
              </q-badge>
              <q-badge outline v-else color="red">{{ todo.events }}</q-badge>
              <br />
              <q-item-label caption>{{ todo.channel }}</q-item-label>
            </div>
          </q-item-label>
          <q-item-label
            lines="5"
            class="q-mt-md text-body2 text-weight-bold text-primary text-weight-medium"
          >
            <div class="q-pa-sm q-gutter-sm">
              <span>{{ todo.title }}</span>
            </div>
          </q-item-label>
          <q-item-label
            lines="5"
            class="q-mt-md text-body2 text-weight-bold text-orange-14 text-weight-medium"
          >
            <div class="q-pa-md q-gutter-md">
              <span>{{ todo.feature }}</span>
            </div>
          </q-item-label>
        </q-item-section>
        <q-item-section side top>
          <q-item-label caption>2 min ago</q-item-label>
          <br />
          <q-item-section avatar top>
            <q-btn
              ripple
              round
              icon="clear"
              color="red"
              size="10px"
              v-if="todo.done"
              @click="removeTodo(todo.id, props.current_page, montage_type)"
            ></q-btn>
          </q-item-section>

          <!--最後面-->
          <q-item-section avatar top v-if="!todo.done">
            <!-- <q-btn class="gt-md" size="20px" flat dense round icon="delete" /> -->
            <dialogs
              :Todo_id="todo.id"
              :current_page="current_page"
              :choose_value="chooseModel"
              :montage_type="montage_type"
            ></dialogs>
          </q-item-section>
        </q-item-section>
        <!---->
      </q-item>
      <q-input outlined bottom-slots v-model="message" label="Label" :dense="dense" readonly>
        <template v-slot:after>
          <q-btn
            round
            dense
            flat
            icon="send"
            @click="addTodo(insert_url, current_page, montage_type)"
          />
        </template>
      </q-input>
    </q-list>
  </q-scroll-area>
</template>

<script>
import { ref, watch, computed, onMounted } from "vue";
import api from "../api/api_connect";
import store from "../store/index";
import dialogs from "../components/dialog.vue";
import axios from "axios";
export default {
  props: {
    current_page: Number,
    montage_type: String,
    insert_url: String,
    input_text: String,
  },
  components: {
    dialogs,
  },
  setup (props) {
    const { host, port, axioss, dateString } = api();
    const todos = computed(() => store.getters["getter_todo"]);
    const dense = ref(false);
    let message = ref("");
    // 選擇看全部OR單頁 oggle
    let chooseModel = ref(false);
    const delete_url = ref("");

    console.log("當天日期", dateString.value);

    var current_time = new Date().toLocaleString("zh-TW", {
      timeZone: "Asia/Taipei",
    });
    console.log("current_time", current_time);

    function hint (length) {
      let hint = "Current labels : " + length;
      return hint;
    }

    // 選擇全部或單頁
    function choose (val, montage) {
      if (val == false) {
        store.dispatch("GET_TODO", props.current_page, montage);
      } else if (val == true) {
        store.dispatch("GET_TODO", 0, montage);
      }
    }

    function addTodo (insert_url, page, montage) {
      axios.post(insert_url).then(() => {
        store.dispatch("GET_TODO", page, montage);
      });
      // 增加完一筆後，將其清空
      message.value = "";
    }

    function removeTodo (id, page, montage) {
      delete_url.value = `http://${host}:${port}/api/v1/cancel?page=${page}&montage=${props.montage_type}&id=${id}`;
      Promise.all([axios.post(delete_url.value)]).then(() => {
        store.dispatch("GET_POSITION", page, montage);
        store.dispatch("GET_TODO", page, montage); // 要get_position才會更新框選的值
      });
    }

    watch(todos.value, () => {
      // console.log("watch todos1 :", todos.value);
    });

    watch(props, () => {
      // console.log("props傳來的值:", props);
      // newTodo.value = props
      console.log("TODO裡面查看目前主頁的page :", props.current_page);
      // 上下頁切換時，TODO的框選數量重置
      chooseModel.value = false;

      //將進來的值賦予message來顯示
      message.value = props.input_text;
      console.log('TODO_montage_type', props.montage_type)
      // console.log("TODO裡面的insert", props.insert_url);
    });
    onMounted(() => {
      store.dispatch("GET_TODO", 1, props.montage_type);
    });
    return {
      dense,
      message,
      chooseModel,
      dateString,
      todos,
      hint,
      choose,
      props,
      addTodo,
      removeTodo,
      current_time

    };
  },
};
</script>
