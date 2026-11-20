<script setup lang="ts">
import { ref } from "vue";
import Card from "primevue/card";
import Slider from "primevue/slider";

const price = defineModel<number[]>({required:true});
const startTip = ref('Min: ' + price.value[0]);
const endTip = ref('Max: ' + price.value[1]);
const syncTooltips = () => {
    startTip.value = `Min: ${price.value[0]}`;
    endTip.value = `Max: ${price.value[1]}`;
};
</script>

<template>
    <Card class="filter-card">
        <template #title>
            <span class="card-title">Preço</span>
        </template>
        <template #content>
            <Slider
            @change="syncTooltips"
            :pt="{
                endHandler:{
                    class: 'before:bg-indigo-600',
                    'v-tooltip.top':{
                        value: endTip,
                        escape:true
                    }
                    
                },
                startHandler:{
                    class: 'before:bg-red-600',
                    'v-tooltip.top': {
                        value: price[1]
                    }
                }
            }"
            v-model="price" range :min="0" :max="10000" aria-label="Preço máximo" />
            <div class="price-labels " aria-hidden="true">
                <span>{{ price[0] }}</span>
                <span>{{ price[1] }}</span>
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

.price-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    line-height: 1;
}

:deep(.p-card-body) {
    gap: 8px;
    padding: 8px;
}

:deep(.p-card-title) {
    margin: 0;
    line-height: 1;
}

:deep(.p-card-content) {
    padding: 0;
}

:deep(.p-slider) {
    height: 3px;
    margin: 5px 3px 0;
}

:deep(.p-slider-handle) {
    width: 15px;
    height: 10px;
}
</style>