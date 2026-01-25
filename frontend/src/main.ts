import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from"primevue/config"
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
const router = createRouter({
   history: createWebHistory(import.meta.env.BASE_URL),
   routes: routes,
})

export default router

const app = createApp(App)
app.use(PrimeVue, {
unstyled:true   
})
app.use(createPinia())
app.use(router)

app.mount('#app')
