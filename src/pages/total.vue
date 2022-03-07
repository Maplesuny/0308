<template>
  <div class="q-pa-md full-height">
    <div class="full-height" style="max-width: 2500px">
      <q-card class="flex fit">
        <q-tabs
          v-model="which"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="A1_A2" label="A1 A2 Montage" />
          <q-tab name="CZ" label="CZ Montage" />
          <q-tab name="Double_Banana" label="Double Banana" />
        </q-tabs>
        <!-- 加入keep-alive 是可以keep住zoom in的狀態，但TODO的會無法更動 -->
        <q-tab-panels v-model="which" style="height: 100%; width: 100%">
          <q-tab-panel name="A1_A2">
            <canvas id="canvas2" style="position: absolute;top: 120px;left: 25px;"></canvas>
            <A1_A2></A1_A2>
          </q-tab-panel>
          <q-tab-panel name="CZ">
            <canvas id="canvas2" style="position: absolute;top: 120px;left: 25px;"></canvas>
            <CZ></CZ>
          </q-tab-panel>
          <q-tab-panel name="Double_Banana">
            <canvas id="canvas2" style="position: absolute;top: 120px;left: 25px;"></canvas>
            <Banana></Banana>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import A1_A2 from "../pages/A1_A2.vue";
import CZ from "../pages/CZ.vue";
import store from "../store/index";
import Banana from "../pages/Double_Banana.vue";
export default {
  components: {
    A1_A2: A1_A2,
    CZ: CZ,
    Banana: Banana,
  },
  setup () {
    const which = ref('A1_A2')

    return { which };
  },
};
</script>
