<template>
  <div class="h-260px">

    <div class="w-100% text-center ">
      <div class="min-h-100px flex justify-center ">
        <vxe-table
          :show-header="false"
          size="mini"
          border="none"
          :column-config="{resizable: true}"
          :mouse-config="{selected: true}"
          height="100px"
          :data="tableData"
          ref="xTable2"
          @keydown-end="handleKeyDown"
          @cell-click="cellClickEvent"
          :row-class-name="'bg-[#f1f2f8]'"
          :keyboard-config="{isArrow: true, isEnter: true}"
          :scroll-y="{enabled: false}">
          <vxe-column field="name" title="name"  width="270px"   >
            <template #default="{row, rowIndex}" class="h-55px">
              <div :class="{'file-active': currentIndex == rowIndex}" class="   p-5px cursor-pointer" >

                 {{row.name.replace(/^.*[\\\/]/, '')}}

              </div>

            </template>
          </vxe-column>

        </vxe-table>
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
          <div class="w-65px   text-left  font-bold text-12px">修改时间</div>
          <div class="w-205px   text-left break-words break-all text-12px">{{selectClipboard.time}}</div>
        </div>
        <div class="   flex item-start">
          <div class="w-65px   text-left  font-bold text-12px">大小</div>
          <div class="w-205px  text-left break-words break-all text-12px">{{byteConvert(selectClipboard.size.split('??::')[currentIndex]??'-')}}</div>
        </div>
        <div class="   flex item-start">

          <div class="w-65px   text-left  font-bold text-12px">状态</div>
          <div class="w-205px  text-left break-words break-all text-12px">
            <a-tooltip title="文件未缓存"  >

              <span></span>
                <a-image
                  v-if="!tableData[currentIndex].exists"
                  width="20px"
                  :src="`cdm-clipboard:///${iconDir()}/error.png`"
                  :fallback="`cdm-clipboard:///${iconDir()}/null.png`"
                  :preview="false"
                />
            </a-tooltip>
            <a-tooltip title="文件已缓存"   >
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
  console.log(newVal);
  tableData.value = newVal.cache.split('??::').map(item => ({name: item, exists: fileIsExists(fileDir(item.replace(/^.*[\\\/]/, '')))}))
  currentIndex.value = 0;
  currentFile.value = tableData.value[currentIndex.value];
}, {deep: true, immediate: true})


function cellClickEvent(ev) {
  // clearTimeout(clickTimer.value);//清除第一次的单击事件
  // clickTimer.value = setTimeout(function () {
  console.log(ev)
  currentFile.value = ev.data[ev.$rowIndex];
  currentIndex.value = ev.$rowIndex;
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
