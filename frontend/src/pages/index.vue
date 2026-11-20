<script setup lang="ts">
import Sidebar from "@/components/sidebar/Sidebar.vue"
import card from "@/components/card.vue";
const produto = {
    "id": 7,
    "nome": "Frango Prático de Macio",
    "precoEmCentavos": 80335,
    "slug": "frango-pratico-de-macio-6",
    "imagem": "https://raw.githubusercontent.com/Eeu2005/Eeu2005/main/Logo/EuLogo.png ",
    "corDestaque": "#1d033d",
    "avaliacaoMedia": 3,
    "tipo": "Casa e Jardim"
}
</script>
<template>
   <main class="flex">
       <Sidebar  class="flex-2"/>
       <aside class=" flex-1 flex gap-3 bg-surface-300">
        <card v-bind="produto"/>
           <card v-bind="produto" />
       </aside>
   </main>
   
</template>   