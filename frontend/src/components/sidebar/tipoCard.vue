<script setup lang="ts">
import { ref } from "vue";
import Button from "primevue/button";
import Card from "primevue/card";
const props = defineProps<{
    list:string[]
}>()
const types = props.list;
const selectedTypes = defineModel<string>({required:true});

function toggleType(type: string) {
    if(type===selectedTypes.value){
        selectedTypes.value=""
    }else{
        selectedTypes.value=type
    }
}
</script>

<template>
    <Card class="filter-card">
        <template #title>
            <span class="card-title">Tipo</span>
        </template>
        <template #content>
            <div class="type-options" aria-label="Tipos de produto">
                <Button v-for="type in types" :key="type" :label="type" :aria-pressed="selectedTypes == type"
                    class="type-option" :class="{ selected: selectedTypes==type }" @click="toggleType(type)" />
            </div>
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
    font-weight: 500;
}

.type-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.type-option {
    min-height: 20px;
    padding: 2px 6px;
    border: 0;
    border-radius: 999px;
    background: white;
    color: var(--color-surface-950);
    line-height: 1;
    transition: all 0.5s;
}

.type-option.selected {
    background: var(--color-roxo-400);
}

:deep(.p-button-label) {
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
</style>