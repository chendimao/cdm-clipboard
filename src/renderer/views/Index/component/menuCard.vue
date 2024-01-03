<template>
  <div>
    <ul class="w-100% pl-20px pr-20px">
      <li class="w-100%  h-40px flex  pl-15px cursor-pointer select-none" style="line-height: 40px" v-for="(item, index) in menuList.filter( item => item.type == selectClipboard.type)" :class="{'menu-active': active == index}" @dblclick="handleEvent(item, index)" @click="active = index" >
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
import {defineProps, watch} from "vue";
import fileIcon from '../../../assets/img/wj.png';
import copyLink from '../../../assets/img/fzdz.png';
import copyFile from '../../../assets/img/fz.png';
import folderOpen from '../../../assets/img/wjj.png';
import clear from '../../../assets/img/ljt.png';
import {message} from "ant-design-vue";
const fileIsExists = require('@electron/remote').getGlobal('fileIsExists');
const fileDir = require('@electron/remote').getGlobal('fileDir');




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

// watch(() => props.selectClipboard, (data) => {
//   console.log(data);
// })


const emits = defineEmits(['setCurrentClipboard', 'deleteData']);


const menuList = ref([
  {name: '打开图片', type: 'img',  keyDown: 'Ctrl+1',  key: 'openImg', value: 1,icon: fileIcon },
  {name: '复制图片', type: 'img',  keyDown: 'Ctrl+2',  key: 'copyImg', value: 4,icon: copyFile },
  {name: '打开目录', type: 'img',  keyDown: 'Ctrl+3',  key: 'openImgPath', value: 2,icon: folderOpen },
  {name: '复制目录', type: 'img',  keyDown: 'Ctrl+4',  key: 'copyPath', value: 3,icon: copyLink },
  {name: '删除图片', type: 'img',  keyDown: 'Ctrl+5',  key: 'remove', value: 5,icon:clear },
  {name: '打开文件', type: 'file',  keyDown: 'Ctrl+1',  key: 'openFile', value: 1,icon: fileIcon },
  {name: '复制文件', type: 'file',  keyDown: 'Ctrl+2',  key: 'copyFile', value: 4,icon: copyFile },
  {name: '打开目录', type: 'file',  keyDown: 'Ctrl+3',  key: 'openFilePath', value: 2,icon: folderOpen },
  {name: '复制目录', type: 'file',  keyDown: 'Ctrl+4',  key: 'copyPath', value: 3,icon: copyLink },
  {name: '删除记录', type: 'file',  keyDown: 'Ctrl+5',  key: 'remove', value: 5,icon:clear },
  {name: '复制文本', type: 'text', keyDown: 'Ctrl+1',   key: 'copy', value: 4,icon: copyFile },
  {name: '删除记录', type: 'text', keyDown: 'Ctrl+2',   key: 'remove', value: 5,icon:clear },
]);

const active = ref(-1);

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
