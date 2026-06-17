import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import VueRouter from "unplugin-vue-router/vite";
import svgLoader from  "vite-svg-loader";
import { defineConfig } from "vite";
import vueDevTools from "vite-plugin-vue-devtools";
// https://vite.dev/config/
export default defineConfig({
	plugins: [tailwindcss(), svgLoader(), VueRouter(), vue(), vueDevTools()],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
});
