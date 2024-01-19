<template>
  <div class="h-240px">
    <div class="h-20px">

    </div>
    <div class="w-100% text-center ">
      <div class="min-h-90px flex justify-center">
        <a-image
          width="100px"
          class="max-h-100px min-h-50px"
          :src="'cdm-clipboard:///' + selectClipboard.img"

        />
      </div>
      <div class="p-5px text-[#035F9D] text-16px font-bold text-truncate">
        {{selectClipboard.img.replace(/^.*[\\\/]/, '')}}
      </div>

      <div class="p-5px">
        <div class="  flex item-start">
          <div class="w-65px  text-left font-bold text-12px">路径</div>
          <div class="w-205px   text-left break-words break-all text-12px overflow-hidden" style="      display: -webkit-box;-webkit-line-clamp: 2;-webkit-box-orient: vertical;">{{selectClipboard.img}}</div>
        </div>
        <div class="   flex item-start">
          <div class="w-65px   text-left  font-bold text-12px">记录时间</div>
          <div class="w-205px   text-left break-words break-all text-12px">{{selectClipboard.time}}</div>
        </div>
        <div class="   flex item-start">
          <div class="w-65px   text-left  font-bold text-12px">大小</div>
          <div class="w-205px  text-left break-words break-all text-12px">{{byteConvert(selectClipboard.size??0)}}</div>
        </div>

        <div class="   flex item-start">

          <div class="w-65px   text-left  font-bold text-12px">状态</div>
          <div class="w-205px  text-left break-words break-all text-12px">
            <a-tooltip title="本地缓存文件丢失"  >

              <span></span>
              <a-image
                v-if="!exists"
                width="20px"
                alt="本地缓存文件丢失"
                :src="`cdm-clipboard:///${iconDir()}/error.png`"
                :fallback="`cdm-clipboard:///${iconDir()}/null.png`"
                :preview="false"
              />
            </a-tooltip>
            <a-tooltip title="本地文件已缓存"   >
              <span></span>
              <a-image
                v-if="exists"
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

const fileIsExists = require('@electron/remote').getGlobal('fileIsExists');
const pluginDir = require('@electron/remote').getGlobal('pluginDir');
const iconDir = require('@electron/remote').getGlobal('iconDir');
const props = defineProps({
  selectClipboard: {
      type: Object,
      default: () => {
      }
    }
    })

const exists = ref(null);
watch(() => props.selectClipboard,(newVal, oldVal) =>{
   exists.value = fileIsExists(newVal.img);
}, {deep: true, immediate: true})
</script>
<style scoped lang="less">

</style>
