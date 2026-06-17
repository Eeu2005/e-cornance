<script setup lang="ts">
defineProps<{
    focused?: boolean,
    onclick?: ((payload: PointerEvent) => void)
}>()
</script>
<template>
    <button
        class="bg-alto-300 pr-2.5 pl-2.5 pt-2 pb-2  transition-all min-w-20  hover:bg-electric-violet-200 hover:rounded-full"
        :class="focused ? 'bg-electric-violet-300 rounded-full' : 'rounded-md'" @click="onclick">
       <div class="flex gap-1 justify-center items-center">
           <slot name="label"></slot>
           <slot name="icon"></slot>
       </div>
    </button>
</template>