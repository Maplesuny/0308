<template>
  <div class="q-pa-sm q-gutter-sm" avatar top>
    <!-- <p>{{ receive_id }}</p> -->
    <q-btn
      unelevated
      rounded
      :color="color"
      size="12px"
      @click="button_up = true"
      v-model="symptom"
    >Select</q-btn>

    <q-dialog v-model="button_up">
      <q-card>
        <q-card-section>
          <div class="text-h6">Set Symptom</div>
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pt-none" style="width: 550px; height: 50vh">
          <div class="q-pa-md q-gutter-sm" style="display: flex">
            <div class="q-gutter-sm">
              <q-radio dense v-model="symptom" val="normal" label="normal" />
              <q-radio dense v-model="symptom" val="abnormal" label="abnormal" />
            </div>

            <div class="q-px-sm q-pt-sm">
              Your selection is:
              <q-badge
                color="white"
                style="font-size: 15px"
                align="middle"
                text-color="indigo-9"
              >{{ symptom }}</q-badge>
            </div>
          </div>
          <q-separator />
          <div class="q-pa-md" style="max-width: 600px">
            <!--Checkbox-->

            <div class="q-gutter-xs">
              <q-btn @click="selectAll">select all</q-btn>
              <q-btn @click="clearAll">unselect all</q-btn>
              <br />
              <br />
              <strong>channel value: {{ selection }}</strong>
              <div>
                <q-checkbox
                  v-for="item in channel"
                  :key="item.id"
                  v-model="selection"
                  :val="item.title"
                  :label="item.title"
                  color="teal"
                />
              </div>
            </div>
            <q-separator />
          </div>
          <!--menu-->
          <div class="q-pa-md">
            <div class="q-gutter-md row items-center">
              <q-btn color="primary" label="Click me">
                <q-menu>
                  <q-separator />
                  <q-item clickable>
                    <q-item-section>Description</q-item-section>
                    <q-item-section side>
                      <q-icon name="keyboard_arrow_right" />
                    </q-item-section>
                    <!--要加入判斷normal abnormal-->
                    <q-menu anchor="top end">
                      <q-item dense clickable v-if="symptom == 'normal'">
                        <q-item-section>normal</q-item-section>
                        <q-item-section side>
                          <q-icon name="keyboard_arrow_right" />
                        </q-item-section>
                        <q-menu anchor="top end" self="top start">
                          <q-item v-for="j in eeg_data[0].state" :key="j" dense clickable>
                            <q-item-section>{{ j.name }}</q-item-section>
                            <q-item-section side>
                              <q-icon name="keyboard_arrow_right" />
                            </q-item-section>
                            <q-menu auto-close anchor="top end" self="top start">
                              <q-item
                                v-for="k in eeg_data[0].state[j.id - 1].symptom"
                                :key="k"
                                dense
                                clickable
                                @click="send_value(k, n, symptom, j.name, k)"
                              >
                                <q-item-section>{{ k }}</q-item-section>
                              </q-item>
                            </q-menu>
                          </q-item>
                        </q-menu>
                      </q-item>
                      <q-item dense clickable v-else>
                        <q-item-section>Abnormal</q-item-section>
                        <q-item-section side>
                          <q-icon name="keyboard_arrow_right" />
                        </q-item-section>
                        <q-menu anchor="top end" self="top start">
                          <q-item v-for="j in eeg_data[1].state" :key="j" dense clickable>
                            <q-item-section>{{ j.name }}</q-item-section>
                            <q-item-section side>
                              <q-icon name="keyboard_arrow_right" />
                            </q-item-section>
                            <q-menu auto-close anchor="top end" self="top start">
                              <q-item
                                v-for="k in eeg_data[1].state[j.id - 1].symptom"
                                :key="k"
                                dense
                                clickable
                                @click="send_value(k, n, symptom, j.name, k)"
                              >
                                <q-item-section>{{ k }}</q-item-section>
                              </q-item>
                            </q-menu>
                          </q-item>
                        </q-menu>
                      </q-item>
                    </q-menu>
                  </q-item>
                  <q-separator />
                </q-menu>
              </q-btn>
              <div class="q-px-sm q-pt-sm caption">
                <p style="font-size: 17px">
                  Your selection is:
                  <q-badge
                    color="white"
                    style="font-size: 20px"
                    align="middle"
                    text-color="red"
                  >{{ select_features }}</q-badge>
                </p>
              </div>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup @click="cancel" />
          <q-btn flat label="OK" v-close-popup @click="ok_send(Todo_id)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, watch, inject, onMounted, computed } from "vue";
import api from "../api/api_connect";
import eeg_data from "../data/eeg_data.json";
import axios from "axios";
import store from "../store/index";
export default {
  props: {
    Todo_id: Number,
    current_page: Number,
    montage_type: String,
    choose_value: Boolean
  },
  setup (props) {
    const { host, port, axioss } = api();
    // button 開啟dialog
    const button_up = ref(false);
    // save症狀  Normal or Abnormal
    const symptom = ref("");
    // save 病理特徵
    const select_features = ref("");
    //Dialog button按鈕
    const select_button = ref("normal");
    const color = ref("primary");
    // 接收CZ.vue傳來的值(我是孫)
    const channel = inject("channel_object");

    // 接收montage_type
    const mmontage_type = inject("mmontage_type")

    // 傳送所選的路徑
    const symptom_path = ref('')

    let update_url = ref("");

    // 當check的v-mode,
    let selection = ref([]);
    let push_select_all = ref([]);

    // 病理特徵選取後儲存
    function send_value (text, get_id, pre, mid, final) {
      // 儲存feature
      select_features.value = text;
      symptom_path.value = pre + '/' + mid + '/' + final
    }

    // checkbox挑選
    function selectAll () {
      push_select_all.value = [];
      for (let i = 0; i < channel.length; i++) {
        push_select_all.value.push(channel[i].title);
      }
      selection.value = push_select_all.value;
    }
    function clearAll () {
      selection.value = [];
    }

    function update_db_url (column, value, id, montage_type) {
      // update_url.value =
      //   "http://" +
      //   host +
      //   ":" +
      //   port +
      //   "/api/v1/update?column=" +
      //   column +
      //   "&value=" +
      //   value +
      //   "&id=" +
      //   id;
      update_url.value = `http://${host}:${port}/api/v1/update?column=${column}&value=${value}&id=${id}&montage_type=${montage_type}`
      return update_url.value;
    }

    // 設定Dialo OK後傳到TODO那邊
    function ok_send (id) {
      Promise.all([
        axios.post(update_db_url("events", symptom_path.value, id, mmontage_type)),
        axios.post(update_db_url("channel", selection.value, id, mmontage_type)),
        axios.post(update_db_url("feature", select_features.value, id, mmontage_type)),
      ]).then(() => {
        // 做全部/單頁的開關
        if (props.choose_value == true) {
          store.dispatch("GET_TODO", 0, mmontage_type);
        } else if (props.choose_value == false) {
          store.dispatch("GET_TODO", props.current_page, mmontage_type);
        }
      });

      console.log("ok_send");
    }

    function cancel () {
      symptom.value = "";
      selection.value = [];
      select_features.value = "";
    }

    // watch Normal
    watch(symptom, () => {
      console.log("watch normal ", symptom.value);
    });
    // watch channel
    watch(selection, () => {
      console.log("which Channel :", selection.value);
    });
    // watch feature
    watch(select_features, () => {
      console.log("watch feature: ", select_features.value);
    });
    watch(props, () => {
      console.log("Current_page", props.current_page);
      console.log('chooseModel', props.choose_value)
      console.log('montage_type', props.montage_type)
    });


    return {
      eeg_data,
      button_up,
      symptom,
      select_features,
      select_button,
      color,
      send_value,
      selectAll,
      clearAll,
      cancel,
      ok_send,
      selection,
      push_select_all,
      channel,
    };
  },
};
</script>
