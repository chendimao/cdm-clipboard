<template>
  <div class="w-100% h-30px bg-[#f6f7fa] flex justify-between border-t-[#ddd] border-1px border-solid ">
    <a-tooltip :title="`记录总条数:${clipboardCount}`">
    <div class="text-11px   color-[#343434]  pl-10px cursor-pointer  flex items-center justify-center ">
<!--       <FileTextOutlined style="font-size: 14px; "  />-->
       <div class="ml-5px">
         <span class="color-gray text-10px">记录数</span> <span class="">{{clipboardCount??'-'}}</span>

       </div>
    </div>
    </a-tooltip>
    <div class=" line-height-18px flex items-center justify-start">
      <div class=" text-11px w-30px color-[#343434] cursor-pointer line-height-30px flex items-center justify-center">
        <a-tooltip title="本地上传到云端">
          <img :src="Sync7" class="w-18px" @click="showSyncDialog"/>

        </a-tooltip>
      </div>
      <div class=" text-11px w-30px color-[#343434] cursor-pointer line-height-30px flex items-center justify-center">
        <a-tooltip title="设置">

          <SettingOutlined @click="showConfig"  style="color: #343434;font-size: 15px;" class="cursor-pointer  "/>
        </a-tooltip>
      </div>

      <sync-dialog v-model:syncVisible="syncVisible" />

    </div>
  </div>
</template>


<script setup lang="ts">
import Sync7 from '../../../assets/img/sync7.png';

import {PushpinOutlined , CarryOutOutlined,SettingOutlined, EyeFilled,FileTextOutlined,FileTextTwoTone, SettingTwoTone, CloudDownloadOutlined} from '@ant-design/icons-vue';
import SyncDialog from "./syncDialog.vue";
import {ref} from "vue";
const { ipcRenderer } = window.electron;
const clipboardCount = require('@electron/remote').getGlobal('clipboardCount');
const syncVisible = ref(false);

function showConfig() {
   ipcRenderer.invoke('handleSetting');
}


function showSyncDialog() {
  syncVisible.value = true;
}

</script>
<style scoped lang="less">
.test {
  color: dodgerblue;
}
</style>
