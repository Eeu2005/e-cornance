import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import Aura from "@primeuix/themes/aura"
import App from './App.vue'
import router from './router'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { definePreset } from '@primeuix/themes';
import { Tooltip } from 'primevue';

const app = createApp(App)
const myPreset = definePreset(Aura,{
    semantic: {
        primary: {
            50: 'var(--color-roxo-50)',
            100: 'var(--color-roxo-100)',
            200: 'var(--color-roxo-200)',
            300: 'var(--color-roxo-300)',
            400: 'var(--color-roxo-400)',
            500: 'var(--color-roxo-500)',
            600: 'var(--color-roxo-600)',
            700: 'var(--color-roxo-700)',
            800: 'var(--color-roxo-800)',
            900: 'var(--color-roxo-900)',
            950: 'var(--color-roxo-950)',
        },
}
})
console.log(import.meta.env)
app.use(createPinia())
app.use(router)
app.use(VueQueryPlugin)
app.directive('tooltip', Tooltip);
app.use(PrimeVue,{
    ptOptions: {
        // mergeSections: true,
        // mergeProps: true
    },
    
    license:import.meta.env['VITE_PRIMEUI-LICENSE-KEY'],
    theme:{
        preset:myPreset,
        options: {
            cssLayer: {
                name: 'primevue',
                order: 'theme, base, primevue',
            },
            darkModeSelector: "none",
        }
}
        })
app.mount('#app')
