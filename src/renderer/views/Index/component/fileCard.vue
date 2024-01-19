<template>
  <div class="h-240px">

    <div class="w-100% text-center ">
      <div class="min-h-100px ">
        <div v-for="(row, index) in tableData" @click="cellClickEvent(row, index)" :class="{'file-active': currentIndex == index}" class=" w-100% text-left h-33px  p-5px cursor-pointer" >
          {{row.name.replace(/^.*[\\\/]/, '')}}
        </div>
<!--        <div v-for="item in selectClipboard.cache.split('??::')">-->
<!--          {{item.cache.split('??::')[0].replace(/^.*[\\\/]/, '')}}-->
<!--        </div>-->
      </div>
      <div class="p-5px text-[#035F9D] text-16px font-bold text-truncate">
<!--        {{selectClipboard.img.replace(/^.*[\\\/]/, '')}}-->
      </div>
      <div class="p-5px">

        <div class="  flex item-start">
          <div class="w-65px  text-left font-bold text-12px">路径</div>
          <div class="w-205px   text-left break-words break-all text-12px overflow-hidden" style="      display: -webkit-box;-webkit-line-clamp: 2;-webkit-box-orient: vertical;">{{selectClipboard.cache.split('??::')[currentIndex]}}</div>
        </div>
        <div class="   flex item-start">
          <div class="w-65px   text-left  font-bold text-12px">记录时间</div>
          <div class="w-205px   text-left break-words break-all text-12px">{{selectClipboard.time}}</div>
        </div>
        <div class="   flex item-start">
          <div class="w-65px   text-left  font-bold text-12px">大小</div>
          <div class="w-205px  text-left break-words break-all text-12px">{{byteConvert(selectClipboard.size.split('??::')[currentIndex]??'-')}}</div>
        </div>
        <div class="   flex item-start">

          <div class="w-65px   text-left  font-bold text-12px">状态</div>
          <div class="w-205px  text-left break-words break-all text-12px">
            <a-tooltip title="文件不存在"  >

              <span></span>
                <a-image
                  v-if="!tableData[currentIndex].exists"
                  width="20px"
                  :src="`cdm-clipboard:///${iconDir()}/error.png`"
                  :fallback="`cdm-clipboard:///${iconDir()}/null.png`"
                  :preview="false"
                />
            </a-tooltip>
            <a-tooltip title="文件存在"   >
              <span></span>
            <a-image
              v-if="tableData[currentIndex].exists"
              width="20px"
              :src="`cdm-clipboard:///${iconDir()}/ok.png`"
              :fallback="`cdm-clipboard:///${iconDir()}/null.png`"
              :preview="false"
            />
            </a-tooltip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">

import { byteConvert } from '../../../utils/index.js'
import {defineProps, watch, ref} from "vue";
const props = defineProps({
  selectClipboard: {
      type: Object,
      default: () => {
      }
    }
    })

const emits = defineEmits(['update:selectFileIndex']);

const fileIsExists = require('@electron/remote').getGlobal('fileIsExists');
const pluginDir = require('@electron/remote').getGlobal('pluginDir');
const iconDir = require('@electron/remote').getGlobal('iconDir');
const fileDir = require('@electron/remote').getGlobal('fileDir');

const tableData = ref([]);
const currentFile = ref();
const currentIndex = ref(0);

watch(() => props.selectClipboard,(newVal, oldVal) =>{
  tableData.value = newVal.cache.split('??::').map(item => ({name: item, exists: fileIsExists(item)}))
  currentIndex.value = 0;
  currentFile.value = tableData.value[currentIndex.value];
}, {deep: true, immediate: true})


function cellClickEvent(row, index) {

  currentFile.value = props.selectClipboard[index];
  currentIndex.value = index;
  emits('update:selectFileIndex', currentIndex.value);
  // 单击事件的代码执行区域
  // ...
  // }, 200)

}

function handleKeyDown(e) {
  console.log(e);
}


</script>
<style scoped lang="less">
.file-active {
  box-shadow: none !important;
  color: #fff !important;
  background: dodgerblue !important;
}
</style>
