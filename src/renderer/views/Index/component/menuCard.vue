<template>
  <div>
    <ul class="w-100% pl-20px pr-20px mt-10px">
      <li class="w-100%  h-40px flex  pl-15px cursor-pointer select-none" style="line-height: 40px" v-for="(item, index) in currentMenuList" :class="{'menu-active': active == index}" @dblclick="handleEvent(item, index)" @click="active = index" >
        <div class="w-200px">
          <img  class="w-22px mr-5px" :src="item.icon"/>
          {{ item.name }}
        </div>
        <div class="float-right text-[gray] mr-5px">
          {{item.keyDown}}
        </div>
      </li>

    </ul>
  </div>
</template>



<script setup lang="ts">
import {computed, defineProps, watch} from "vue";
import fileIcon from '../../../assets/img/wj.png';
import copyLink from '../../../assets/img/fzdz.png';
import copyFile from '../../../assets/img/fz.png';
import folderOpen from '../../../assets/img/wjj.png';
import clear from '../../../assets/img/ljt.png';
import {message} from "ant-design-vue";
const fileIsExists = require('@electron/remote').getGlobal('fileIsExists');
const fileDir = require('@electron/remote').getGlobal('fileDir');
const Cnofig = require('@electron/remote').getGlobal('Config');



const { ipcRenderer } = window.electron;
const props = defineProps({
  selectClipboard: {
    type: Object,
    default: () => {
    }
  },
  selectIndex: {
    type: Number,
    default: 0
  },
  selectFileIndex: {
    type: Number,
    default: 0
  }
})




const emits = defineEmits(['setCurrentClipboard', 'deleteData']);


const menuList = ref([
  {name: '打开图片', type: 'img',  keyDown: '',  key: 'openImg', value: 1,icon: fileIcon },
  {name: '复制图片', type: 'img',  keyDown: '',  key: 'copyImg', value: 4,icon: copyFile },
  {name: '打开目录', type: 'img',  keyDown: '',  key: 'openImgPath', value: 2,icon: folderOpen },
  {name: '复制目录', type: 'img',  keyDown: '',  key: 'copyPath', value: 3,icon: copyLink },
  {name: '删除记录', type: 'img',  keyDown: '',  key: 'remove', value: 5,icon:clear },
  {name: '打开文件', type: 'file',  keyDown: '',  key: 'openFile', value: 1,icon: fileIcon },
  {name: '复制文件', type: 'file',  keyDown: '',  key: 'copyFile', value: 4,icon: copyFile },
  {name: '打开目录', type: 'file',  keyDown: '',  key: 'openFilePath', value: 2,icon: folderOpen },
  {name: '复制目录', type: 'file',  keyDown: '',  key: 'copyPath', value: 3,icon: copyLink },
  {name: '删除记录', type: 'file',  keyDown: '',  key: 'remove', value: 5,icon:clear },
  {name: '复制文本', type: 'text', keyDown: '',   key: 'copy', value: 4,icon: copyFile },
  {name: '删除记录', type: 'text', keyDown: '',   key: 'remove', value: 5,icon:clear },
]);

const currentMenuList = computed(() => menuList.value.filter(
  item => item.type == props.selectClipboard.type).map(
    (item, index) => {
      item.keyDown = Cnofig['b' + (index + 2)]
      return item;
    }));

const active = ref(-1);

ipcRenderer.on('setMenuShortcut', (res, data) => {
  handleEvent(currentMenuList.value[data], data);
})



watch(() => currentMenuList, (data) => {

  ipcRenderer.invoke('handleMenuShortcut', data.value.length??0)
  active.value = 0;

}, {deep: true, immediate: true})



function handleEvent(row, index) {
  active.value = index;
  contextMenuClickEvent(row.key);
}




function contextMenuClickEvent(key) {

  const selectClipboard = props.selectClipboard;

  const methods = {

    'remove': () => {
      ipcRenderer.invoke('deleteClipboard', selectClipboard.hash, selectClipboard.type).then( res => {
        if (res){
          // 删除前端展示记录
          emits('deleteData', props.selectIndex)
          message.success('删除成功');
        }
      });
    },
    'removeFile': () => {
      ipcRenderer.invoke('deleteClipboard', selectClipboard.hash, selectClipboard.type).then( res => {
        if (res){
          // 删除前端展示记录
          emits('deleteData', props.selectIndex)
          message.success('删除成功');
        }
      });
    },
    'copy': () => {
      emits('setCurrentClipboard', selectClipboard);
      message.success('复制成功');
    },
    'copyFile': () => {
      if(!fileIsExists(selectClipboard.cache.split('??::')[props.selectFileIndex])){
        message.error('该文件不存在'); return;
      }

      ipcRenderer.invoke('isCopyFile',  [selectClipboard.cache.split('??::')[props.selectFileIndex]])
      message.success('复制成功');
    },
    'copyImg': () => {

      if(!fileIsExists(selectClipboard.img)){
        message.error('该文件不存在'); return;
      }

      emits('setCurrentClipboard', selectClipboard);
      message.success('复制成功');
    },
    'copyPath': () => {
      ipcRenderer.invoke('copyPath', selectClipboard.img || selectClipboard.cache.split('??::')[props.selectFileIndex])
      message.success('复制成功');
    },

    'openFilePath': () => {
      ipcRenderer.invoke('openPath', selectClipboard.cache.split('??::')[props.selectFileIndex]);

    },
    'openImg': () => {
      if(!fileIsExists(selectClipboard.img)){
        message.error('该文件不存在'); return;
      }
      console.log('openimg');
      ipcRenderer.invoke('openFile', selectClipboard.img.replaceAll('/','\\'));
    },
    'openFile': () => {
      if(!fileIsExists(selectClipboard.cache.split('??::')[props.selectFileIndex])){
        message.error('该文件不存在'); return;
      }
      ipcRenderer.invoke('openFile', selectClipboard.cache.split('??::')[props.selectFileIndex].replaceAll('/','\\'));
    },
    'openImgPath': () => {
      if(!fileIsExists(selectClipboard.img)){
        message.error('该文件已不存在'); return;
      }
      ipcRenderer.invoke('openPath', selectClipboard.img.replaceAll('/','\\'));
    }
  }
  methods[key]();

}






</script>
<style scoped lang="less">
  .menu-active {
    background-color: #508bb9;
    color: #fff;
    border-radius: 5px;
    div {
      color: #fff;
    }
  }
</style>
