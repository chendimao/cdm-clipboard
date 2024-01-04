<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN';


const locale = zhCN;
</script>

<template>
  <a-config-provider   :locale="locale"  >

    <router-view></router-view>
  </a-config-provider>


</template>

<style lang="less">

</style>
