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

/*黑色主题*/
// import 'highlight.js/styles/atom-one-dark.css';
/*白色主题*/
import 'highlight.js/styles/stackoverflow-light.css';
import hljs from 'highlight.js/lib/core';
// import javascript from 'highlight.js/lib/languages/javascript';
import hljsVuePlugin from "@highlightjs/vue-plugin";
// 批量引入常用语言库
import 'highlight.js/lib/common';




app.directive('menus', directive); // 只注册指令

app.directive('highlight', function (el) {
  let highlight = el.querySelectorAll('div');
  highlight.forEach((block) => {
    // Deprecated as of 10.7.0. highlightBlock will be removed entirely in v12.0
    // Deprecated as of 10.7.0. Please use highlightElement now.
    hljs.highlightElement(block);
  })
});


import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
app.use(VueVirtualScroller)

app.use(Antd);
app.use(hljsVuePlugin);
app.use(router);
app.mount('#app')
