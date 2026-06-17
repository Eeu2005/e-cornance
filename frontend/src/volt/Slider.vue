<template>
    <Slider
        unstyled
        :pt="sliderPt"
        :ptOptions="{
            mergeProps: ptViewMerge
        }"
    >
  
       
    </Slider>
   
</template>

<script setup lang="ts">
import Slider, {
	type SliderPassThroughOptions,
	type SliderProps,
} from "primevue/slider";
import { computed, ref } from "vue";
import { ptViewMerge } from "./utils";

interface Props extends /* @vue-ignore */ SliderProps {}
const props = defineProps<Props>();
const handleCommon = `cursor-grab touch-none flex items-center justify-center h-[16px] w-[16px] 
        rounded-full
        absolute
        top-[-5px]
		w-[16px] h-[16px] block rounded-full
		bg-alto-900
        transition duration-200
        p-horizontal:-mt-[-0px] p-horizontal:-ms-[0px]
        p-vertical:start-0 p-vertical:-mb-[1px] p-vertical:-ms-[1px]
        focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-alto-600 
        focus-visible:scale-125
        before:absolute
        before:shadow-[0px_0.5px_0px_0px_rgba(0,0,0,0.08),0px_1px_1px_0px_rgba(0,0,0,0.14)]
        before:transition before:duration-200
        `;

const theme = ref<SliderPassThroughOptions>({
	root: `relative bg-alto-200 rounded-xs
            p-horizontal:h-[3px]
            p-vertical:min-h-[100px] p-vertical:w-[3px]`,
	range: `block bg-electric-violet-950 rounded-xs h-[4px]
            p-horizontal:top-0 p-horizontal:start-0 p-horizontal:h-full
            p-vertical:bottom-0 p-vertical:start-0 p-vertical:w-full`,
	handle: handleCommon,
	startHandler: handleCommon,
	endHandler: handleCommon,
});
const resolvedValue = computed(() =>
	props.modelValue !== undefined ? props.modelValue : (props.defaultValue ?? 0),
);

const singleLabel = computed(() =>
	!props.range ? String(resolvedValue.value) : "0",
);

const startLabel = computed(() =>
	props.range && Array.isArray(resolvedValue.value)
		? String(resolvedValue.value[0])
		: "0",
);

const endLabel = computed(() =>
	props.range && Array.isArray(resolvedValue.value)
		? String(resolvedValue.value[1])
		: "0",
);
const sliderPt = computed<SliderPassThroughOptions>(() => ({
	root: theme.value.root,
	range: theme.value.range,
	// modo simples
	handle: {
		class: handleCommon,
		"v-tooltip.top": {
			value: singleLabel.value,
		},
	},
	// modo range — handle inicial
	startHandler: {
		class: handleCommon,
		"v-tooltip.top": {
			value: startLabel.value,
		},
	},
	// modo range — handle final
	endHandler: {
		class: handleCommon,
		"v-tooltip.top": {
			value: endLabel.value,
		},
	},
}));
</script>
