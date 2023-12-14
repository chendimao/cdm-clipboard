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
import {
  // 全局对象
  VXETable,

  // 表格功能
  // Filter,
  // Edit,
   Menu,
  // Export,
  // Keyboard,
  // Validator,

  // 可选组件
  Column,
  // Colgroup,
  // Grid,
   Tooltip,
  // Toolbar,
  // Pager,
  // Form,
  // FormItem,
  // FormGather,
  // Checkbox,
  // CheckboxGroup,
  // Radio,
  // RadioGroup,
  // RadioButton,
  // Switch,
  // Input,
  // Select,
  // Optgroup,
  // Option,
  // Textarea,
  // Button,
  // Modal,
  // List,
  // Pulldown,

  // 表格
  Table
} from 'vxe-table'
import zhCN from 'vxe-table/es/locale/lang/zh-CN'
import 'vxe-table/styles/cssvar.scss'



function useTable (app: App) {

  app.use(Column)
  // 表格功能
  // app.use(Filter)
  // .use(Edit)
   .use(Menu)
  // .use(Export)
  // .use(Keyboard)
  // .use(Validator)

  // 可选组件

    // .use(Colgroup)
    // .use(Grid)
    // .use(Tooltip)
    // .use(Toolbar)
    // .use(Pager)
    // .use(Form)
    // .use(FormItem)
    // .use(FormGather)
    // .use(Checkbox)
    // .use(CheckboxGroup)
    // .use(Radio)
    // .use(RadioGroup)
    // .use(RadioButton)
    // .use(Switch)
    // .use(Input)
    // .use(Select)
    // .use(Optgroup)
    // .use(Option)
    // .use(Textarea)
    // .use(Button)
    // .use(Modal)
    // .use(List)
    // .use(Pulldown)

    // 安装表格
    .use(Table)
}



app.use(Antd).use(useTable);
app.use(router);
app.mount('#app')
