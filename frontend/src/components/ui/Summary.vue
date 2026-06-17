<template>
  <div class="transition flex flex-col  gap-2  bg-alto-50  shadow-2xl  min-w-xs mr-1 ml-1 p-2.5 rounded-xl">
    <div class=" flex gap-4 justify-between " @click="clickHandle">
      <p>{{ label }}</p>
      <PhArrowDown class="transition self-center size-5 " :class="!cliqued ? 'rotate-180' : ''" />

    </div>
    <Transition name="slide">
     <div class="w-full" :hidden="cliqued">
       <slot ref="contentRef"  name="conteudo"></slot>
     </div>
    </Transition>
  </div>
 
</template>

<script lang="ts" setup>
import { PhArrowDown } from "@phosphor-icons/vue";
import { nextTick, ref } from "vue";

const { label } = defineProps({
	label: String,
});

let cliqued = ref(false);

const clickHandle = () => {
	cliqued.value = !cliqued.value;
};
</script>

<style>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease-in-out;
  max-height: 500px;
  /* ajuste conforme necessário */
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-9px);
}
</style>