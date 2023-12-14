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

import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

app.component('RecycleScroller', RecycleScroller)

app.directive('menus', directive); // 只注册指令

app.use(Antd);
app.use(router);
app.mount('#app')
