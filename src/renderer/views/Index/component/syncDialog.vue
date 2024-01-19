<template>
  <a-modal :visible="syncVisible"  title="同步管理" @ok="handleOk" @cancel="handleClose">
    <p>上次同步时间: <span class="color-[orangered]">2024-01-17</span></p>
    <p>
      <a-button @click="uploadWebdav" :loading="uploadLoading" >本地覆盖云端</a-button>
    </p>
    <p>
      <a-button>云端覆盖本地</a-button>
    </p>
  </a-modal>
</template>


<script setup lang="ts">
import {defineProps, watch, ref} from "vue";
import {message} from "ant-design-vue";

const { ipcRenderer } = window.electron;

const props = defineProps({
  syncVisible: {
    type: Boolean,
    default: false,
  }
})

const emit = defineEmits(['update:syncVisible']);


const uploadLoading = ref(false);
const downLoading = ref(false);




function handleOk() {
  emit('update:syncVisible', false);
}

function handleClose() {
  emit('update:syncVisible', false);
}

function uploadWebdav() {
  uploadLoading.value = true;
  ipcRenderer.invoke('uploadWebdav').then(res =>{
    console.log(res);
    uploadLoading.value = false;
    if(res == 'Created'){
      message.success('同步成功');
    } else {
      message.error('上传失败，请稍候再试');
    }
  })
}


</script>
<style scoped lang="less">

</style>
