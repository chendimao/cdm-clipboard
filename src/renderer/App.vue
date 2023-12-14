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
    <div class="h-40px w-full     ">
      <div class="  h-40px flex justify-end items-center text-center ">
        <div class="w-320px h-40px is-drag">

        </div>
        <div class="w-40px h-40px flex items-center hover:bg-[#eee]" @click="min" >
          <minus theme="outline" size="24" class="w-40px " fill="#333" />
        </div>
       <div class="w-40px h-40px flex items-center hover:bg-[#eee]" @click="close">
         <close-small theme="outline" size="24"  class="w-40px  " fill="#333"/>
        </div>


      </div>
    </div>
    <router-view></router-view>
  </a-config-provider>


</template>

<style lang="less">
 .is-drag {
   -webkit-app-region: drag;
 }
</style>
