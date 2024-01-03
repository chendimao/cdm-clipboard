

<template>

  <div>
    <div class="h-40px w-full    bg-[#f6f7fa] my-header">
      <div class="  h-40px flex justify-end items-center text-center ">
        <div class="w-580px h-40px flex justify-start bg-[#f1f3f8] ">
          <div class="is-drag w-40px h-40px select-none cursor-pointer">
            <a-image
              class=" mt-10px ml-5px"
              width="25px"
              :src="`cdm-clipboard:///${iconDir()}/search.png`"
              :fallback="`cdm-clipboard:///${iconDir()}/null.png`"
              :preview="false"
            />
          </div>
          <div class="p-10px w-540px is-drag">
            <a-input
              ref="searchRef"
              class="bg-[#f1f3f8]  text-left is-no-drag"
              placeholder="搜索剪切板"
              @focus="inputFocus = true"
              @blur="inputFocus = false"
              v-model:value="query"/>
          </div>
        </div>
        <!--        <div class="w-40px h-40px flex items-center hover:bg-[#eee]" @click="min" >-->
        <!--          <minus theme="outline" size="24" class="w-40px " fill="#333" />-->
        <!--        </div>-->
        <!--       <div class="w-40px h-40px flex items-center hover:bg-[#eee]" @click="close">-->
        <!--         <close-small theme="outline" size="24"  class="w-40px  " fill="#333"/>-->
        <!--        </div>-->


      </div>
    </div>

    <div class=" w-100% h-530px p-8px flex justify-start">
      <template v-if="list.length > 0">
        <div class="w-280px mytable-scrollbar">
          <DynamicScroller
            class="scroller  h-480px "
            :items="list"
            :item-size="55"
            key-field="hash"
            :minItemSize="55"
            :emitUpdate="false"
            @update="updateRow"
            ref="scrollView"
            @scroll="handleScroll"
            v-slot="{ item , index}"
          >
            <div :class="{'active': selectIndex == index}" @click="cellClickEvent(item, index)" class="pl-5px w-280px hover:bg-[#d5d5d8] border-1px border-solid border-[#f1f2f8] border-l-2px border-l-solid border-l-[#f1f2f8] border-r-2px border-r-solid border-r-[#f1f2f8]"  >
              <div v-if="item.text" class="text-black text-truncate select-none w-100%   cursor-pointer  h-55px" @click.ctrl="showDetail(item)" @dblclick="setCurrentClipboard(item )">

                <div class=" w-260px  flex items-center ">
                  <a-image
                    width="28px"
                    :src="'cdm-clipboard:///' + iconDir() + '/copy.png'"
                    :fallback="'cdm-clipboard:///' + iconDir() + '/1.png'"
                    :preview="false"
                  />
                  <div class="text-16px ml-5px h-100%  w-220px  line-height-55px text-truncate " v-html="item.innerHtml "   >

                  </div>

                </div>

              </div>
              <div v-else-if="item.img" class="w-100% pt-5px  cursor-pointer select-none h-55px "  @click.ctrl.prevent="openFile(item.img)" @dblclick.prevent="setCurrentClipboard(item)">
                <!--              <img :src="icon" />-->
                <div class=" w-260px  flex items-center">

                  <a-image
                    width="28px"
                    :src="`cdm-clipboard:///${iconDir()}/${item.img.substring(item.img.lastIndexOf('.') + 1)}.png`"
                    :fallback="`cdm-clipboard:///${iconDir()}/null.png`"
                    :preview="false"
                  />
                  <div class="text-black text-bold ml-5px text-15px w-220px">
                    <div class="text-truncate" v-html=" item.innerHtml " > </div>
                    <a-tooltip :title="item.img" :mouseEnterDelay="1">
                      <div class="text-[gray] text-12px text-truncate"  > {{item.img}}</div>
                    </a-tooltip>
                  </div>
                </div>
              </div>
              <div  v-else-if="item.cache" class="w-100% pt-5px  cursor-pointer select-none h-55px "   @dblclick="setCurrentClipboard(item)">
                <div class=" w-260px  flex items-center">
                  <a-image
                    width="28px"
                    :src="`cdm-clipboard:///${iconDir()}/${item.cache.split('??::')[0].substring(item.cache.split('??::')[0].lastIndexOf('.') + 1)}.png`"
                    :fallback="`cdm-clipboard:///${iconDir()}/null.png`"

                    :preview="false"
                  />
                  <div class="text-black text-bold ml-5px text-15px w-220px" @click="selectFile = item.cache.split('??::')[0]">
                    <div class="text-truncate"> <span v-html="item.innerHtml"></span><span v-if="item.cache.split('??::').length > 1">等{{item.cache.split('??::').length}}个文件</span></div>
                    <a-tooltip :title="item.cache.replaceAll('??::', ', ')" :mouseEnterDelay="1">
                      <div class="text-[gray] text-12px text-truncate">{{ item.cache.split('??::')[0] }}</div>
                    </a-tooltip>
                  </div>
                </div>

              </div>

            </div>
          </DynamicScroller>
        </div>

        <div class="w-290px bg-[#f6f7fa] border-1px rd-5px ml-5px my-card  overflow-auto">
          <div class="w-full  " v-if="selectClipboard">
            <div v-if="selectClipboard.type == 'text'" class="h-260px  p-5 overflow-auto  " v-highlight   >
              <div  v-html="brightenKeyword(hljs.highlightAuto(selectClipboard.text).value, escapeHtml(query))">
              </div>
            </div>

            <div v-else-if="selectClipboard.type == 'img'"  >
              <img-card :select-clipboard="selectClipboard"/>
            </div>

            <div v-else-if="selectClipboard.type == 'file'"  >
              <file-card :select-clipboard="selectClipboard" v-model:selectFileIndex="selectFileIndex"/>
            </div>

            <menu-card  :select-clipboard="selectClipboard" :selectIndex="selectIndex" @setCurrentClipboard="setCurrentClipboard" @deleteData="deleteData" :selectFileIndex="selectFileIndex" />

          </div>


        </div>

      </template>
      <div v-else class="w-100% h-100% flex justify-center items-center">
        <a-empty ></a-empty>
      </div>

    </div>
  </div>
</template>



<script setup lang="ts">
import {ref, onMounted, computed, watch, shallowRef, h, onUnmounted} from 'vue'
import { useRouter } from 'vue-router'
import { getGlobal } from '@electron/remote/'
import remote from '@electron/remote/'
import {message, Modal} from 'ant-design-vue'
import * as dayjs from "dayjs";
import imgCard from './component/imgCard.vue';
import fileCard from './component/fileCard.vue';
import menuCard from './component/menuCard.vue';
import hljs from "highlight.js/lib/core";

require('dayjs/locale/zh-cn');
dayjs.locale('zh-cn');
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime) // use plugin

const { ipcRenderer } = window.electron
const account = ref('')
const password = ref('')
const app = require('@electron/remote').getGlobal('app');
const iconDir = require('@electron/remote').getGlobal('iconDir');
const pluginDir = require('@electron/remote').getGlobal('pluginDir');
const router = useRouter()
const xTable = ref()
const list = ref([])
const tabKey = ref('')
const icon = ref('');
const searchTimer = ref();

const scrollView = ref();
const searchRef = ref();

const currentClipboard = ref(); // 当前剪切板
const selectClipboard = ref(); // 当前鼠标单击选项
const selectIndex = ref(0);
const selectFile = ref();
const selectFileIndex = ref();

const inputFocus = ref(false);


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
const limit = ref(20);
const page =  ref(0);

watch(query, (data) => {
  page.value = 0;
  getData(data);
}, {immediate: true})

 const clickTimer = ref();

function updateRow(ev) {
  console.log(ev);
}
//
// function escapeHtml(html) {
//   const text = document.createTextNode(JSON.parse(JSON.stringify(html)));
//   const div = document.createElement('div');
//   div.appendChild(text);
//   return div.innerHTML.replace(new RegExp('&amp;', 'gi'), `&`);
// }
function escapeHtml(str) {
  var temp = "";
  if(str.length == 0) return "";
  temp = str.replace(/&/g,"&amp;");
  temp = temp.replace(/</g,"&lt;");
  temp = temp.replace(/>/g,"&gt;");
  temp = temp.replace(/\s/g,"&nbsp;");
  temp = temp.replace(/\'/g,"&#39;");
  temp = temp.replace(/\"/g,"&quot;");
  return temp;
}

function htmlDecode (text){
               //1.首先动态创建一个容器标签元素，如DIV
               var temp = document.createElement("div");
               //2.然后将要转换的字符串设置为这个元素的innerHTML(ie，火狐，google都支持)
               temp.innerHTML = text;
               //3.最后返回这个元素的innerText或者textContent，即得到经过HTML解码的字符串了。
               var output = temp.innerText || temp.textContent;
               temp = null;
               return output;
           }






//  滚动到底部
function handleScroll(ev) {
  const {scrollTop, clientHeight, scrollHeight} = ev.target
  // console.log(scrollTop, clientHeight, scrollHeight)
  if (scrollTop + clientHeight === scrollHeight){
    page.value += 1;
    getData();
  }
}




onMounted( async() => {
  // getClipboardList()
  // icon.value = (await app.getFileIcon('F:\\www\\cdm-clipboard\\node_modules\\electron\\dist\\data\\db\\clipboard.db')).toDataURL();
  //console.log(await getIcon('txt'))
  getData()
  ipcRenderer.on('setClipboard', (event, arg) => {

    if (arg) {
      arg.innerHtml = brightenKeyword(escapeHtml(arg.type == 'text' ? arg.text : arg.type == 'img' ? arg.img.replace(/^.*[\\\/]/, '') : arg.cache.split('??::')[0].replace(/^.*[\\\/]/, '')), escapeHtml(query.value));
      list.value.unshift(arg);
        selectIndex.value = 0;
        selectClipboard.value = arg;
        currentClipboard.value = arg;
      document.querySelector('.vue-recycle-scroller').scrollTop = 0;
    }
  })

  ipcRenderer.on('updateData',  (event, arg) =>{
    console.log(arg, 247);
    updateData(arg);
    //getData();
  })
  document.addEventListener('keydown', handleKeyDown);
})

watch(currentClipboard, (data) => {
  console.log(data, 56)
})

function getClipboardList() {
  ipcRenderer.invoke('getClipboardFiles').then((res) => {
    console.log(res, 237);
    //list.value = res;
  })
}


// 打开文件
function openFile(item) {
  console.log(item, 78);
  ipcRenderer.invoke('openFile', item);
}



function getData(keyword = undefined) {
  let params = {syncStatus: 0}

  ipcRenderer.invoke('getClipboardList', params, keyword??undefined, limit.value, page.value * limit.value).then((res) => {
    console.log(res, 259);
    if (page.value === 0 ) {
      list.value = [];
    }
    list.value = list.value.concat(res).map(item => {
      item.innerHtml = brightenKeyword(escapeHtml(item.type == 'text' ? item.text : item.type == 'img' ? item.img.replace(/^.*[\\\/]/, '') : item.cache.split('??::')[0].replace(/^.*[\\\/]/, '')), escapeHtml(query.value));
      return item;
    });
    if (page.value === 0 ) {
      currentClipboard.value = res[0];
      selectClipboard.value = res[0];
      selectIndex.value = 0;
    }
    console.log(list.value.length);


  })
}


// 设置当前双击项为最新剪切项
function setCurrentClipboard(row) {
  console.time('test');
  updateData(row);
  console.timeEnd('test');


}




// 数据放到第一条
async function updateData(res) {

  // 如果当前数据已经在第一条，则不操作
  if (list.value[0].hash == res.hash) {
    console.log('is first');
    return;
  }
  ipcRenderer.invoke('setCurrentClipboard', res.hash, res.type).then(res => {});
  const len = list.value.length;

  for (let i = 0; i < len; i++) {
    if (list.value[i].hash == res.hash) {
      const  data = list.value.splice(i, 1);
      list.value.unshift(data[0]);
      selectIndex.value = 0;
      currentClipboard.value = data[0];
      selectClipboard.value = data[0];
      document.querySelector('.vue-recycle-scroller').scrollTop = 0;
      break;
    }
  }
}

// 删除数据
function deleteData(index) {
  list.value.splice(index, 1);
  currentClipboard.value = list.value[index];
  selectClipboard.value = list.value[index];
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


const handleKeyDown = (event) => {
  console.log(event, inputFocus.value, searchRef.value);

  const eventFun = {
    'Space': () => {

      // 如果搜索框没有聚焦 空格预览
      if (!inputFocus.value) {
        event.preventDefault();
        // 在这里执行要触发的逻辑
        ipcRenderer.invoke('openQuickLook', selectClipboard.value.img || selectFile.value  || selectClipboard.value.text,  selectClipboard.value.text ? true : false);

      }

    },
    'F5': () => {
      page.value = 0;
      query.value = '';
      getData();
      document.querySelector('.vue-recycle-scroller').scrollTop = 0;
    },
    'ArrowDown': () => {
      if (selectIndex.value == list.value.length) {
        selectIndex.value =  0 ;
        selectClipboard.value = list.value[0];
      } else {
        selectIndex.value += 1;
        selectClipboard.value = list.value[selectIndex.value];
      }

    },
    'ArrowUp': () => {
      if (selectIndex.value == 0) {
        selectIndex.value =  list.value.length ;
        selectClipboard.value = list.value[selectIndex.value];
      } else {
        selectIndex.value -= 1;
        currentClipboard.value = list.value[selectIndex.value];
        selectClipboard.value = list.value[selectIndex.value];
      }

    }
  }

  if (Object.keys(eventFun).includes(event.code)) {
    eventFun[event.code]()
  } else {
    console.log(event.key)
    if (
      (event.keyCode >= 48&& event.keyCode <=57) ||
      (event.keyCode >= 65&& event.keyCode <=90) ||
      (event.keyCode >= 96&& event.keyCode <=107) ||
      (event.keyCode >= 109&& event.keyCode <=111) ||
      (event.keyCode >= 186&& event.keyCode <=222)

      ){
        searchRef.value.focus();
    }
  }




}


function cellClickEvent(item, index) {

    selectClipboard.value = item;
    selectIndex.value = index;
    // 单击事件的代码执行区域
    // ...
  // }, 200)



}

//搜索高亮
function brightenKeyword(val, keyword) {
  if(!query.value) return val;
  // 匹配关键字正则
  return val.replace(new RegExp(keyword, 'gi'), `<span class="text-[red] bg-[#DCF89D]">${keyword}</span>`);
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

.active {
  box-shadow: none !important;
  border: 1px solid #e2e1e1 !important;
  border-left: 2px solid #009688 !important;
  background: #f6f7fa !important;
}


.is-drag {
  -webkit-app-region: drag;
}
.is-no-drag {
  -webkit-app-region: no-drag;
}


</style>
