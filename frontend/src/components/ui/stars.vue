<script lang="ts" setup>
import { PhStar } from "@phosphor-icons/vue";

let model = defineModel<number>({ default: 0 });
    let onclick =  (value:number) => model.value=value
 const props = defineProps<{
	total: number;
	selecionado?: number;
}>()
const cont  = model.value===0?(props.selecionado??props.total):model

</script>

<template>
    <div  class="flex flex-row">
        <label v-for="n in total"  v-on:click="onclick(n)" for="">
        <PhStar class="hover:bg-alto-50 text-electric-violet-950"
                :weight="cont >= n ? 'fill' : 'regular'" color="var(--color-electric-violet-500)" />
                <input type="checkbox" :value="n" :checked="cont >= n" class="invisible">
        </label>
    </div>
</template>