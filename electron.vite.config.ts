import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from '@unocss/vite';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import AutoImport from 'unplugin-auto-import/vite'


export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(),]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src/renderer')
      }
    },
    plugins: [
      vue() ,
      UnoCSS(),
      Components({
          resolvers: [
            AntDesignVueResolver({
              importStyle: false,//是否需要自动随引入加载对应的组件样式
            })
          ],
        }),
      AutoImport({
      imports: [
        'vue',
        'vue-router',

      ]
    })]
  }
})
