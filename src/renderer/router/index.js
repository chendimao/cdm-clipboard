import { createRouter, createWebHashHistory } from 'vue-router'
import Index from '@/views/Index/Index.vue'
import Home from '@/views/home/home.vue'

const routes = [
  // 精确匹配 #/login，指向Login页面
  { path: '/index', component: Index, exact: true },
  // 精确匹配 #/home，指向Home页面
  { path: '/home', component: Home, exact: true },
  // 空hash，则跳转至Login页面
  { path: '', redirect: 'index' },
  // 未匹配，则跳转至Login页面
  { path: '/:pathMatch(.*)', redirect: 'index' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
