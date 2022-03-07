import axios from "axios";
import api from '../api/api_connect'
import { ref, computed, reactive,onMounted } from "vue";
import store from '../store/index';

export default function useTodos () {
     const { host, port, axioss } = api()

     const todos = computed(() => store.getters['getter_todo']);


    onMounted(() => {
            store.dispatch('GET_TODO')
        })
}