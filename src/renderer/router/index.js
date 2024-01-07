import { createRouter, createWebHashHistory } from 'vue-router'
import Index from '@/views/Index/Index.vue'
import Setting from '@/views/Setting/Index.vue'

const routes = [
  // 精确匹配 #/index，指向Login页面
  { path: '/index', component: Index, exact: true },
  { path: '/setting', component: Setting, exact: true },
  // 空hash，则跳转至Login页面
  { path: '', redirect: 'index' },
  // 未匹配，则跳转至Login页面
  { path: '/:pathMatch(.*)', redirect: 'index' },
]

const router = createRouter({
  mode: 'hash',
  history: createWebHashHistory(),
  routes,
})

export default router
