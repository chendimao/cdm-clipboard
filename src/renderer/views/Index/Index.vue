

<template>
  <div class=" w-100% h-610px">
<!--    <a-input-search-->
<!--      v-model:value="query"-->
<!--      placeholder="input search text"-->
<!--      style="width: 200px"-->
<!--      @search="getData"-->
<!--    />-->
    <a-button @click="donwloadQuick">下载quickLook</a-button>

    <vxe-table
      height="577"
      class="mytable-scrollbar"
      :show-header="false"
      :row-config="{isHover: true, isCurrent: true,}"
      :data="list"
      ref="xTable"
      :menu-config="menuConfig"
      :mouse-config="{selected: true}"
      @cell-click="cellClickEvent"
      @menu-click="contextMenuClickEvent"
      :keyboard-config="{isArrow: true, isEnter: true}"
      :scroll-y="{enabled: false}">
      <vxe-column type="seq" width="50"></vxe-column>
      <vxe-column field="name" title="Name" width="340"   class="h-100px">

        <template #default="{row, index}">

            <div v-if="row.text" class="text-black text-truncate select-none w-100% pt-10px pb-10px" @click.ctrl="showDetail(row)" @dblclick="setCurrentClipboard(row.hash, 'text')">
              <div class="" >{{ row.text }}</div>
            </div>
            <div v-else-if="row.img" class="w-100% pt-10px pb-10px "  @click.ctrl.prevent="openFile(row.img)" @dblclick.prevent="setCurrentClipboard(row.hash, 'img')">
              <div class=" w-90% text-left flex items-center">
                <a-image
                  class="h-20px  p-2"
                  :src="'cdm-clipboard:///' + row.img"
                  :alt="row.img"
                  :preview="false"
                />
              </div>
            </div>
            <div v-else-if="row.file" class="w-100%  pt-10px pb-10px"   @dblclick="setCurrentClipboard(row.hash, 'file')">

<!--              <div v-if="row.file.split(',').length > 1" class=" cursor-pointer hover:decoration-underline text-12px" @click="showFileDetail(row.file.split(','))">-->
<!--                <span class="text-[dodgerblue]">【{{row.file.split(',')[0].substring(row.file.split(',')[0].lastIndexOf('\\') + 1,row.file.split(',')[0].length )}}】</span>-->
<!--                等{{row.file.split(',').length}}个文件-->
<!--              </div>-->
              <div   class="text-[dodgerblue] text-truncate cursor-pointer hover:decoration-underline  text-12px " v-for="i in row.file.split(',')"  @click.ctrl="openFile(i)">{{ i }}</div>
            </div>

        </template>
      </vxe-column>

    </vxe-table>
  </div>
</template>



<script setup lang="ts">
import {ref, onMounted, computed, watch, shallowRef, h, onUnmounted} from 'vue'
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
const xTable = ref()
const list = ref([])
const tabKey = ref('')

const currentClipboard = ref(); // 当前剪切板
const selectClipboard = ref(); // 当前鼠标单击选项

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
        {code: 'refresh', name: '刷新列表',   disabled: false},
        {code: 'copyImg', name: '复制图片',   disabled: false},
        {code: 'copyPath', name: '复制目录',   disabled: false},
        {code: 'openImgPath', name: '打开目录',   disabled: false},
        {code: 'remove', name: '删除图片', disabled: false},

      ]
    } else if (data.row.file) {
      data.options[0] = [
        {code: 'refresh', name: '刷新列表',   disabled: false},
        {code: 'copyFile', name: '复制文件',   disabled: false},
        {code: 'copyPath', name: '复制目录',   disabled: false},
        // {code: 'openFilePath', name: '打开文件目录',   disabled: false},
        {code: 'openCachePath', name: '打开目录',   disabled: false},
        {code: 'remove', name: '删除文件', disabled: false},

      ]
    } else {
      data.options[0] = [
        {code: 'refresh', name: '刷新列表',   disabled: false},
        {code: 'copy', name: '复制文本',   disabled: false},
        {code: 'remove', name: '删除文本', disabled: false},

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

         if (res && deleteData(ev.row)) message.success('删除成功');

      });
    },
    'copy': () => {
      setCurrentClipboard(ev.row.hash,  'text')
      message.success('复制成功');
    },
    'copyFile': () => {
      setCurrentClipboard(ev.row.hash,  'file')
      message.success('复制成功');
    },
    'copyImg': () => {
      setCurrentClipboard(ev.row.hash,  'img')
      message.success('复制成功');
    },
    'copyPath': () => {
      ipcRenderer.invoke('copyPath', ev.row.img || ev.row.file.split(',')[0])
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
     // currentClipboard.value = arg
     // console.log(currentClipboard, 50)
      //list.value.unshift(arg)
      xTable.value.insert(arg);
    }
  })

  ipcRenderer.on('updateData',  (event, arg) =>{
      matchData(arg);
    //getData();
  })
  document.addEventListener('keydown', handleKeyDown);
  console.log(document.querySelector('.vxe-table--body-wrapper.body--wrapper'));
  document.querySelector('.vxe-table--body-wrapper.body--wrapper').onkeydown = handleSpaceBar;

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
    currentClipboard.value = res[0];
  })
}

// 设置当前双击项为最新剪切项
function setCurrentClipboard(hash, type) {
  ipcRenderer.invoke('setCurrentClipboard', hash, type).then(res => {
    console.log(res, 272);
    currentClipboard.value = res;
    //matchData(res);
    // getData();

  });
}



// 数据放到第一条
async function matchData(res) {
  console.log(xTable.value.getTableData())
  const {fullData} = xTable.value.getTableData();
  const len = fullData.length;
  let data;
  for (let i = 0; i < len; i++) {
    if (fullData[i].hash == res.hash) {
      data = fullData[i];
      break;
    }
  }
   const isdel = await xTable.value.remove(data);
  console.log(isdel);
   if (isdel) {
     xTable.value.insert(res);
   }

   //跳转到第一条
  xTable.value.scrollToRow(xTable.value.getData(0))
  console.log(list.value, res, 286);

}

// 删除数据
function deleteData(item) {
  return xTable.value.remove(item);
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

function donwloadQuick() {
  ipcRenderer.invoke('downloadQuickLook');
}

const handleKeyDown = (event) => {
  console.log(event);
  if (event.code === 'Space') {
    // 在这里执行要触发的逻辑
    console.log(selectClipboard.value.img || selectClipboard.value.file);
    if (selectClipboard.value.img || selectClipboard.value.file ) {
      ipcRenderer.invoke('openQuickLook', selectClipboard.value.img || selectClipboard.value.file );
    }
    console.log('Space', selectClipboard.value)
  }




}


function cellClickEvent(ev) {
    selectClipboard.value = ev.data[ev.$rowIndex];
    console.log(selectClipboard.value);

}

// 取消空格带动滚动条
function handleSpaceBar(ev) {
  console.log(ev);

  if(ev.preventDefault){
    ev.preventDefault();
  }else{
    window.event.returnValue = false;
  }

}



onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
})



</script>


<style   lang="less">

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

v-deep(.ant-image-preview-wrap) {
  top: 40px;
}



</style>
