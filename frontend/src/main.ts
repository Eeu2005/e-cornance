import { createPinia } from "pinia";
import { Tooltip } from "primevue";
import PrimeVue from "primevue/config";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";
import App from "./App.vue";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: routes,
});

export default router;

const app = createApp(App);
app.directive("tooltip", Tooltip);
app.use(PrimeVue, {
	unstyled: true,
});
app.use(createPinia());
app.use(router);

app.mount("#app");
