<script setup lang="ts">
 import type { GetProdutoResponse} from "@/api/types.gen"
import { Rating } from "primevue";
 type Produto = {
    id: number;
    nome: string;
    precoEmCentavos: number;
    slug: string;
    imagem: string;
    corDestaque: string | null;
    avaliacaoMedia: number;
    tipo: string | null;
}
 const props = defineProps<Produto>()
</script>
<template>
    <div class="flex flex-col bg-white h-fit ">
        <div class="header-img">
            <img :src="props.imagem" :alt="props.nome">
        </div>
       <div class="p-5">
           <h1 class="text-3xl text-center"> {{ props.nome }}</h1>
            <P class="text-sm text-center">{{ $props.tipo }}</P>
       </div>
       <div>
        <span>{{ props.precoEmCentavos }}</span>
        <span><Rating disabled v-model="props.avaliacaoMedia""></Rating></span>
       </div>

    </div>
</template>

<style lang="css" scoped>
.header-img{
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    background:  v-bind("props.corDestaque");
    &>img{
       object-fit: cover;
        display: block;
        height: 170px;

    }
}
</style>