import { defineConfig } from "orval";
export default defineConfig({
	ecornance: {
		input: "http://127.0.0.1:1234/api/doc/openapi.json",
		output: {
			baseUrl: "http://127.0.0.1:1234",
			client: "vue-query",
			httpClient: "axios",
			target: "src/api/index.ts",
			mode: "tags-split",
		},
	},
});
