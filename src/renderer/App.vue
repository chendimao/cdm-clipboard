<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import {CloseSmall, Minus} from "@icon-park/vue-next";

const { ipcRenderer } = window.electron
const locale = zhCN;
const number = ref(5);


function min() {
ipcRenderer.invoke('handleMin');

}

function close() {
  ipcRenderer.invoke('handleClose');
}


</script>

<template>
  <a-config-provider   :locale="locale"  >

    <router-view></router-view>
  </a-config-provider>


</template>

<style lang="less">

</style>
