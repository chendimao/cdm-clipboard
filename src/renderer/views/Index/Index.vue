<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getDownLoadUrl } from '../../utils/index.js'
import { getGlobal } from '@electron/remote/'
import remote from '@electron/remote/'
import { message } from 'ant-design-vue'
import * as dayjs from "dayjs";

require('dayjs/locale/zh-cn');
dayjs.locale('zh-cn');
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime) // use plugin

const { ipcRenderer } = window.electron
const account = ref('')
const password = ref('')

const router = useRouter()

const list = ref([])
const tabKey = ref('')

const currentClipboard = ref()

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
  // getClipboardList()
  //const app = require('@electron/remote').getGlobal('mainWindow');
  getData()
  ipcRenderer.on('setClipboard', (event, arg) => {
    console.log(dayjs.locale('zh-cn'))
    if (arg) {
      // if (arg.file) {
      //    arg.file =  arg.file.split(',') ;
      // }
      currentClipboard.value = arg
      console.log(currentClipboard, 50)
      list.value.unshift(arg)
    }
  })

  ipcRenderer.on('updateData',  (event, arg) =>{
     getData();
  })

})

watch(currentClipboard, (data) => {
  console.log(data, 56)
})

function getClipboardList() {
  ipcRenderer.invoke('getClipboardFiles').then((res) => {
    //list.value = res;
  })
}


// 双击打开文件
function openFile(item) {
  console.log(item, 78);
  ipcRenderer.invoke('openFile', item);
}

function getData() {
  ipcRenderer.invoke('getClipboardList', { syncStatus: 0 }).then((res) => {
    list.value = res
  })
}

// 设置当前双击项为最新剪切项
function setCurrentClipboard(hash) {
  ipcRenderer.invoke('setCurrentClipboard', hash).then(res => {
    getData();
  });
}

</script>

<template>
  <div class="P-login w-100%">
<!--    <a-button @click="getData">重新获取数据</a-button>-->
    <a-tabs v-model:activeKey="tabKey">
      <a-tab-pane key="" tab="全部">
        <a-list bordered :data-source="list">
          <template #renderItem="{ item, index }">

            <a-tooltip v-if="item.text" placement="top" :title="item.text" mouseEnterDelay="1">
              <a-list-item  class="text-truncate" @dblclick="setCurrentClipboard(item.hash)">
                <div  class="text-truncate select-none">
                  <span class="text-12px text-[gray] mr-5 text-right">{{dayjs(item.time).fromNow()}}</span>
                  <span class="text-[black]">{{ item.text }}</span>

                </div>
              </a-list-item>
            </a-tooltip>

            <a-list-item v-if="item.img" @click.ctrl="openFile(item.img)">
              <img :src="'cdm-clipboard:///' + item.img" alt="" class="w-80%" />
            </a-list-item>
            <a-tooltip v-if="item.file && item.file.length > 0" placement="top" :title="item.file.split(',')">
              <a-list-item v-if="item.file && item.file.length > 0">
                <div   class="text-[dodgerblue] text-truncate cursor-pointer hover:decoration-underline  " v-for="i in item.file.split(',')"  @click.ctrl="openFile(i)">{{ i }}</div>
              </a-list-item>
            </a-tooltip>

          </template>
        </a-list>
      </a-tab-pane>
      <a-tab-pane key="text" tab="文本">
        <a-list bordered :data-source="textList">
          <template #renderItem="{ item }">
            <a-tooltip v-if="item.text"  placement="top" :title="item.text">
              <a-list-item v-if="item.text" >
                <div  class="text-truncate">{{ item.text }}</div>
              </a-list-item>
            </a-tooltip>

          </template>
        </a-list>
      </a-tab-pane>
      <a-tab-pane key="img" tab="图片" force-render>
        <a-list bordered :data-source="imgList">
          <template #renderItem="{ item }">
            <a-list-item v-if="item.img" @click.ctrl="openFile(item.img)" >
              <img :src="'cdm-clipboard:///' + item.img" alt="" class="w-80% text-center" />
            </a-list-item>
          </template>
        </a-list>
      </a-tab-pane>
      <a-tab-pane key="file" tab="文件">
        <a-list bordered :data-source="fileList">
          <template #renderItem="{ item }">
            <a-tooltip v-if="item.file && item.file.length > 0" placement="top" :title="item.file.split(',')">
              <a-list-item v-if="item.file && item.file.length > 0">
                <div   class="text-[dodgerblue] text-truncate cursor-pointer hover:decoration-underline  " v-for="i in item.file.split(',')"  @click.ctrl="openFile(i)">{{ i }}</div>
              </a-list-item>
            </a-tooltip>
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
