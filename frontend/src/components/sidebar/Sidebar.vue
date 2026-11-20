<script lang="ts" setup>
import PrecoCard from "./precoCard.vue";
import TipoCard from "./tipoCard.vue";
import ClassificacaoCard from "./classificacaoCard.vue";
import { Button } from "primevue";
import { ref } from "vue";
const rating = ref(3)
const precos = ref([0, 5000])
const tipoSelecionado = ref("")
</script>

<template>
    <aside class="filters-sidebar" aria-label="Filtros de produtos">
        <h1 class="sidebar-title">Filtre o resultado</h1>
        <PrecoCard  v-model="precos" />
        <TipoCard :list="['caixas','sla','asaas']" v-model="tipoSelecionado" />
        <ClassificacaoCard  v-model="rating"/>
        <Button class="filtrar">Filtrar</Button>
    </aside>
</template>

<style scoped>
.filtrar{
    border-radius: var(--radius-sm);
}
.filters-sidebar {
    box-sizing: border-box;
    display: flex;
    flex: 0 0 15%;
    flex-direction: column;
    gap: 18px;
    min-height: 100vh;
    padding: 10px 8px;
    background: var(--color-roxo-300);
}

.sidebar-title {
    margin: 0 0 50px 0px;
    color: var(--color-surface-950);
    font-weight: 600;
    line-height: 1.2;
    text-align: center;
    font-size: 1.6em;
}
</style>