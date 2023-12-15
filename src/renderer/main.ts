import 'virtual:uno.css';
import '@/common/css/global.less';
import '@/common/css/reset.css';
import { createApp } from 'vue'
import App from './App.vue';

import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import router from './router';
const app = createApp(App);
app.config.productionTip = false;
import { directive } from 'vue3-menus';
import "@icon-park/vue-next/styles/index.css";

app.directive('menus', directive); // 只注册指令

import XEUtils from 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'


function useTable (app: App) {
  app.use(VXETable)
}




app.use(Antd).use(useTable);
app.use(router);
app.mount('#app')
