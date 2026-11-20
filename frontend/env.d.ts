/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly "VITE_PRIMEUI-LICENSE-KEY": string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}