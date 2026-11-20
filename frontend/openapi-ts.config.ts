import {defineConfig} from"@hey-api/openapi-ts"
export default defineConfig({
    input:"http://127.0.0.1:1234/api/doc/openapi.json",
    output:"src/api",
    plugins: ['@hey-api/client-ky',"@tanstack/vue-query",'zod',]
})