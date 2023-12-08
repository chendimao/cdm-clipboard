<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getDownLoadUrl } from '../../utils/index.js'
import { getGlobal } from '@electron/remote/'
import remote from "@electron/remote/";
import {app} from "@electron/remote";
const { ipcRenderer } = window.electron
const account = ref('')
const password = ref('')

const router = useRouter()

const list = ref([])
const tabKey = ref('')

const textList = computed(() => {
  return list.value.filter((item) => item.text)
})

const htmlList = computed(() => {
  return list.value.filter((item) => item.html)
})
const rtfList = computed(() => {
  return list.value.filter((item) => item.rtf)
})
const imgList = computed(() => {
  return list.value.filter((item) => item.img)
})
const fileList = computed(() => {
  return list.value.filter((item) => item.file)
})

function toHome() {
  router.push('/home')
}

onMounted(() => {
  getClipboardList()
  const app = require('@electron/remote').getGlobal('mainWindow');
  console.log(app)
  setTimeout(() => {
    //console.log(remote)
  }, 5000)
  ipcRenderer.on('setClipboard', (event, arg) => {
    if (arg) {
      if (arg.img) {
        // arg.img =   getDownLoadUrl();
      }

      list.value.unshift(arg)
    }
  })
})

function getClipboardList() {
  ipcRenderer.invoke('getClipboardFiles').then((res) => {
    //list.value = res;
  })
}

function handleDownload() {
  ipcRenderer
    .invoke('downloadFiles', 'http://119.23.65.117:888/zentao/file-read-2243.png')
    .then((res) => {
      //list.value = res;
    })
}
</script>

<template>
  <div class="P-login">
    <a-button @click="getClipboardList">剪切板</a-button>
    <a-button @click="handleDownload">下载</a-button>
    <a-tabs v-model:activeKey="tabKey">
      <a-tab-pane key="" tab="全部">
        <a-list bordered :data-source="list">
          <template #renderItem="{ item }">
            <a-list-item v-if="item.text">
              {{ item.text }}
            </a-list-item>
            <a-list-item v-if="item.img">
              <img :src="'cdm-clipboard:///' + item.img" alt="" class="w-80%" />
            </a-list-item>
            <a-list-item v-if="item.file">
              {{ item.file }}
            </a-list-item>
          </template>
        </a-list>
      </a-tab-pane>
      <a-tab-pane key="text" tab="文本">
        <a-list bordered :data-source="textList">
          <template #renderItem="{ item }">
            <a-list-item v-if="item.text">
              {{ item.text }}
            </a-list-item>
          </template>
        </a-list>
      </a-tab-pane>
      <a-tab-pane key="img" tab="图片" force-render>
        <a-list bordered :data-source="imgList">
          <template #renderItem="{ item }">
            <a-list-item v-if="item.img">
              <img :src="item.img" alt="" class="w-80%" />
            </a-list-item>
          </template>
        </a-list>
      </a-tab-pane>
      <a-tab-pane key="file" tab="文件">
        <a-list bordered :data-source="fileList">
          <template #renderItem="{ item }">
            <a-list-item v-if="item.file">
              {{ item.file }}
            </a-list-item>
          </template>
        </a-list>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<style scoped lang="less">
.P-login {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}
.logo {
  display: block;
  margin: 50px auto 20px;
  height: 128px;
}

.ipt-con {
  margin: 0 auto 20px;
  width: 100%;
  text-align: center;
}
</style>
