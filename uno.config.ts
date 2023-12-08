import { defineConfig, presetAttributify, presetUno } from 'unocss'

export default defineConfig({
  shortcuts: {
    'wh-full': 'w-full h-full'
  },
  theme: {
    breakpoints: {
      xxs: '0px',
      xs: '320px',
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      xxl: '1600px',
    },
  },
  presets: [presetUno(), presetAttributify()]
})