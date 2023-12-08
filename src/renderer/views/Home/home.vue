<template>
<h1>Home</h1>
  <a-button @click="back">返回</a-button>
  <a-button @click="getVersion">获取版本号</a-button>
  <a-button @click="readDir">读取目录</a-button>
  <a-button @click="getClipboardFiles">获取剪切板</a-button>
  <div v-for="item in fileList">
    {{item}}
  </div>
</template>

<script setup lang="ts">
const { ipcRenderer } = window.electron;
import {useRouter} from "vue-router";

const router = useRouter();
const fileList = ref([]);

function back() {
  router.back();
}

function readDir() {
  ipcRenderer.send('readDir', {msg: 'test'});
  window.api.readDirReply((ev, res) => {
    console.log(ev, res);
    if (!res.canceled) {
      console.log(res);
      fileList.value =  res.fileList;
    }
  })
}

function getVersion() {
  ipcRenderer.invoke('getElectronVersion').then(res => {
    console.log(res);
  })
}

function getClipboardFiles() {
  ipcRenderer.invoke('getClipboardFiles').then(res => {
    console.log(res);
  });
}




</script>
<style scoped lang="less">

</style>
