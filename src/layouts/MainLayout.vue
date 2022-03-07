<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="bg-blue-grey-6">
        <q-btn flat dense round icon="menu" aria-label="Menu" />

        <q-toolbar-title>
          CMUH AI CENTER
          <q-btn>Change PatientID</q-btn>
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-page-container style="height: 94vh">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>

import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "MainLayout",

  setup () {
    const leftDrawerOpen = ref(false);

    return {

    };
  },
});
</script>
