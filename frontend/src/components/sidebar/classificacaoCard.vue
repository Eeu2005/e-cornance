<script setup lang="ts">
import { ref } from "vue";
import Card from "primevue/card";
import Rating from "primevue/rating";

const model = defineModel<number>();
</script>

<template>
    <Card class="filter-card">
        <template #title>
            <span class="card-title ">Classificação</span>
        </template>
        <template #content>
            <Rating v-model="model" :stars="5" :cancel="false" aria-label="Classificação mínima" />
        </template>
    </Card>
</template>

<style scoped>
.filter-card {
    border-radius: 8px;
    background: var(--color-surface-100);
    box-shadow: none;
}

.card-title {
    text-align: center;
    font-weight: 500;
}

:deep(.p-card-body) {
    gap: 10px;
    padding: 8px;
}

:deep(.p-card-title) {
    margin: 0;
    line-height: 1;
}

:deep(.p-card-content) {
    padding: 0;
}

:deep(.p-rating) {
    gap: 1px;
}

:deep(.p-rating-item) {
    width: 12px;
    height: 12px;
}

:deep(.p-rating-icon) {
    width: 10px;
    height: 10px;
}
</style>