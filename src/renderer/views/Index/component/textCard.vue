<template>
  <div>
    <div  class="h-240px  p-5 overflow-auto  " v-highlight>
      <div  v-html="brightenKeyword(hljs.highlightAuto(clipboard.text).value, escapeHtml(q))">
      </div>
    </div>
    <div class="p-5px">

      <div class="   flex item-start">
        <div class="w-65px   text-left  font-bold text-12px">记录时间</div>
        <div class="w-205px   text-left break-words break-all text-12px">{{clipboard.time}}</div>
      </div>
      <div class="   flex item-start">
        <div class="w-65px   text-left  font-bold text-12px">大小</div>
        <div class="w-205px  text-left break-words break-all text-12px">{{byteConvert(clipboard.size??0)}}</div>
      </div>

    </div>
  </div>
</template>



<script setup lang="ts">

import {byteConvert} from '../../../utils/index.js'
import {defineProps, watch, ref} from "vue";
import hljs from "highlight.js/lib/core";

const fileIsExists = require('@electron/remote').getGlobal('fileIsExists');
const pluginDir = require('@electron/remote').getGlobal('pluginDir');
const iconDir = require('@electron/remote').getGlobal('iconDir');
const getTextIsize = require('@electron/remote').getGlobal('getTextIsize');
const props = defineProps({
  selectClipboard: {
      type: Object,
      default: () => {
      }
    },
  query: {
    type: String,
    default: ''
  }
    })

const exists = ref(null);
const clipboard = ref();
const q = ref();
watch(() => props.selectClipboard,(newVal, oldVal) =>{
  clipboard.value = newVal;
  clipboard.value.size = getTextIsize(clipboard.value.text??'');
}, {deep: true, immediate: true})
watch(() => props.query,(newVal, oldVal) =>{
  q.value = newVal;
}, { deep: true,immediate: true})

function brightenKeyword(val, keyword) {
  if(!keyword) return val;

  // 匹配关键字正则
  return val.replace(new RegExp(keyword, 'gi'), `<span class="text-[red] bg-[#DCF89D]">${keyword}</span>`);
}
function escapeHtml(str) {
  let temp = "";
  if(str.length == 0) return "";
  temp = str.replace(/&/g,"&amp;");
  temp = temp.replace(/</g,"&lt;");
  temp = temp.replace(/>/g,"&gt;");
  temp = temp.replace(/\s/g,"&nbsp;");
  temp = temp.replace(/\'/g,"&#39;");
  temp = temp.replace(/\"/g,"&quot;");
  return temp;
}


</script>
<style scoped lang="less">

</style>
