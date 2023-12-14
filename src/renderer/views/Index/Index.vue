

<template>
  <div class=" w-100% h-610px">
<!--    <a-input-search-->
<!--      v-model:value="query"-->
<!--      placeholder="input search text"-->
<!--      style="width: 200px"-->
<!--      @search="getData"-->
<!--    />-->
    <vxe-table
      show-overflow
      height="600"
      class="mytable-scrollbar"
      :show-header="false"
      :row-config="{isHover: true, isCurrent: true,}"
      :data="list"
      :menu-config="menuConfig"
      @menu-click="contextMenuClickEvent"
      :scroll-y="{enabled: true}">
      <vxe-column type="seq" width="50"></vxe-column>
      <vxe-column field="name" title="Name" width="340"   show-overflow="title" class="h-100px">

        <template #default="{row, index}">

            <div v-if="row.text" class="text-black text-truncate select-none" @click.ctrl="showDetail(row)" @dblclick="setCurrentClipboard(row.hash)">
              <div class="" >{{ row.text }}</div>
            </div>
            <div v-else-if="row.img" class="w-100%  "  @click.ctrl.prevent="openFile(row.img)" @dblclick="setCurrentClipboard(row.hash)">
              <div class=" w-90% text-left flex items-center">
                <a-image
                  class="h-48px p-2"
                  :src="'cdm-clipboard:///' + row.img"
                  :alt="row.img"
                />
              </div>
            </div>
            <div v-else-if="row.file" class="w-100%  "   @dblclick="setCurrentClipboard(row.hash)">

              <div v-if="row.file.split(',').length > 1" class=" cursor-pointer hover:decoration-underline text-12px" @click="showFileDetail(row.file.split(','))">
                <span class="text-[dodgerblue]">【{{row.file.split(',')[0].substring(row.file.split(',')[0].lastIndexOf('\\') + 1,row.file.split(',')[0].length )}}】</span>
                等{{row.file.split(',').length}}个文件
              </div>
              <div v-else  class="text-[dodgerblue] text-truncate cursor-pointer hover:decoration-underline  text-12px " v-for="i in row.file.split(',')"  @click="openFile(i)">{{ i }}</div>
            </div>

        </template>
      </vxe-column>

    </vxe-table>
  </div>
</template>



<script setup lang="ts">
import { ref, onMounted, computed, watch, shallowRef, h } from 'vue'
import { useRouter } from 'vue-router'
import { getDownLoadUrl } from '../../utils/index.js'
import { getGlobal } from '@electron/remote/'
import remote from '@electron/remote/'
import {message, Modal} from 'ant-design-vue'
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

const query = ref('');

watch(() => query, (data) => {
  console.log(data);
}, {immediate: true})


const menuList = ref([
  {code: 'refresh', name: '刷新',   disabled: false},
  {code: 'copy', name: '复制',   disabled: false},
  {code: 'remove', name: '删除', disabled: false},

]);



const menuConfig = ref({
  body: {
    options: [
      menuList.value
    ]
  },

  visibleMethod (data) {
    console.log(data);
    if (data.row.img) {
      data.options[0] = [
        {code: 'refresh', name: '刷新',   disabled: false},
        {code: 'copy', name: '复制',   disabled: false},
        {code: 'openImgPath', name: '打开图片目录',   disabled: false},
        {code: 'remove', name: '删除', disabled: false},

      ]
    } else if (data.row.file) {
      data.options[0] = [
        {code: 'refresh', name: '刷新',   disabled: false},
        {code: 'copy', name: '复制',   disabled: false},
        {code: 'openFilePath', name: '打开文件目录',   disabled: false},
        {code: 'openCachePath', name: '打开缓存目录',   disabled: false},
        {code: 'remove', name: '删除', disabled: false},

      ]
    } else {
      data.options[0] = [
        {code: 'refresh', name: '刷新',   disabled: false},
        {code: 'copy', name: '复制',   disabled: false},
        {code: 'remove', name: '删除', disabled: false},

      ]
    }
    return true
  }

});



function contextMenuClickEvent(ev) {

  const methods = {
    'refresh': () => {
      query.value = '';
      getData(query.value);
      message.success('刷新成功');
    },
    'remove': () => {
      ipcRenderer.invoke('deleteClipboard', ev.row.hash).then( res => {

         if (res && deleteData(ev.row.hash)) message.success('删除成功');

      });
    },
    'copy': () => {
      setCurrentClipboard(ev.row.hash)
      message.success('复制成功');
    },
    'openFilePath': () => {
      openPath(ev.row.file.split(',')[0]);
    },
    'openCachePath': () => {
      openPath(ev.row.cache.split(',')[0]);
    },
    'openImgPath': () => {
      openPath(ev.row.img.replaceAll('/','\\'));
    }
  }
  methods[ev.menu.code]();

}

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
    console.log(arg, 64);
    matchData(arg);
    //getData();
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


// 打开文件
function openFile(item) {
  console.log(item, 78);
  ipcRenderer.invoke('openFile', item);
}

// 打开文件目录
function openPath(item) {
  console.log(item, 78);
  ipcRenderer.invoke('openPath', item);
}

function getData() {
  let params = {syncStatus: 0}
  if (query.value) params.text = query.value
  ipcRenderer.invoke('getClipboardList', params).then((res) => {
    console.log(res);
    list.value = res
  })
}

// 设置当前双击项为最新剪切项
function setCurrentClipboard(hash) {
  ipcRenderer.invoke('setCurrentClipboard', hash).then(res => {
    console.log(res, 95);
    matchData(res);
    // getData();
  });
}

// 数据放到第一条
function matchData(res) {
  if (res) {
    let listLen =  list.value.length;
    for (let i = 0; i < listLen; i++) {
      if (list.value[i].hash == res.hash) {
        list.value.splice(i, 1);
        return true
      }
    }
    list.value.unshift(res);
  }
  return false;
}

// 删除数据
function deleteData(hash) {

    let listLen =  list.value.length;
    for (let i = 0; i < listLen; i++) {
      if (list.value[i].hash == hash) {
        list.value.splice(i, 1);
        return true;
      }
    }
  console.log(252);
    return false;
}
const showDetail = (info) => {
  Modal.success({
    title: () => null,
    icon: () => null,
    content: () => h('div', {}, [
      h('p', info.text)

    ]),
  });
};

const showFileDetail = (files) => {
  Modal.success({
    title: () => null,
    icon: () => null,
    content: () => h('div', {}, [
      h('p', files.map(item => {
        return h('p',
          {class: 'text-[dodgerblue] text-truncate cursor-pointer hover:decoration-underline text-13px ',
            onClick: (event) => {
               openFile(item);
            }},
          item)
      }))

    ]),
  });
};
</script>


<style scoped lang="less">

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

.list {
  &::-webkit-scrollbar  {
    width: 9px;
  }
  &::-webkit-scrollbar-thumb  {
    background-color: #ccc;
    border-radius: 8px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: darkgray;
  }
}

::v-deep(td.vxe-body--column) {
  line-height: 48px;
}

.mytable-scrollbar ::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
/*滚动条的轨道*/
.mytable-scrollbar ::-webkit-scrollbar-track {
  background-color: #FFFFFF;
}
/*滚动条里面的小方块，能向上向下移动*/
.mytable-scrollbar ::-webkit-scrollbar-thumb {
  background-color: #bfbfbf;
  border-radius: 5px;
  border: 1px solid #F1F1F1;
  box-shadow: inset 0 0 6px rgba(0,0,0,.3);
}
.mytable-scrollbar ::-webkit-scrollbar-thumb:hover {
  background-color: #A8A8A8;
}
.mytable-scrollbar ::-webkit-scrollbar-thumb:active {
  background-color: #787878;
}
/*边角，即两个滚动条的交汇处*/
.mytable-scrollbar ::-webkit-scrollbar-corner {
  background-color: #FFFFFF;
}


</style>
