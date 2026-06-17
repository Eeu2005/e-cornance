<template>
    <div class="relative   bg-alto-200 flex items-center shadow-2xs shadow-alto-950 w-100% border has-focus:border-electric-violet-800 has rounded-1xl">
        <AutoComplete :suggestions="items"  v-model="value" append-to="body" optionLabel="nome" @complete="search" class="peer " pt:root="ps-2"
        
            pt:overlay=" bg-transparent shadow-none border-0 text-alto-50 mt-3" pt:pcinputtext:root="border-0  focus:outline-0 w-180"
            pt:list="gap-3  min-w-1xs "
            pt:option=" p-0 transition-all shadow  gap-3 z-10" placeholder="Pesquisar...">
            <template #loader>
                <PhCircleNotch class="rotate text-3xl  bg-alto-200 z-10 rounded-full" />
            </template>
            <template #empty="{slotProps}">
                <h1 class=" bg-electric-violet-500/70 p-4">{{slotProps }}Sinto muito mas esse item não existe </h1>
            </template>
            <template #option="slotProps">
                <RouterLink custom :to="`/produtos/${slotProps.option.slug}`" v-slot="{navigate}" >
                <div v-on:click="navigate"
                    class="flex  gap-1.5 p-3  static text-alto-50  hover:bg-electric-violet-500 min-w-180 items-center justify-between border-b border-solid  bg-linear-90 from-[#695749] from-0% to-electric-violet-900 to-100% ">
                    <img class="h-5 w-10 object-fit " :alt="slotProps.option.nome.slice(0,5)"
                        :src="slotProps.option.imagem" />
                    <div>
                        <h1 class="text-center">{{ slotProps.option.nome }}</h1>
                    </div>
                    <span>{{ format(slotProps.option.precoCentavos / 100) }}</span>
                </div>
            </RouterLink>
            </template>
        
        </AutoComplete>
       <PhMagnifyingGlass
            class="absolute top-1/2 -mt-2 z-0 text-surface-400 leading-none end-3   peer-focus:invisible" />
    </div>
</template>

<script setup lang="ts">
const { format } = Intl.NumberFormat("pt-br", { style: "currency", currency: "BRL" })
import { PhMagnifyingGlass, PhCircleNotch } from '@phosphor-icons/vue'
import AutoComplete from '@/volt/AutoComplete.vue';

import { ref } from 'vue';
const value = ref(null);
const data = [
    {
        "id": 0,
        "nome": "Cadeira Lustroso de Granito",
        "descricao": "Ergonomic Sapatos made with Congelado for all-day chato support",
        "imagem": "https://picsum.photos/seed/iiZnla6iky/3095/556",
        "slug": "Cadeira-Lustroso-de-Granito",
        "precoCentavos": 72296
    },
    {
        "id": 1,
        "nome": "Computador Gostoso de Concreto",
        "descricao": "Rústico Queijo designed with Granito for visível performance",
        "imagem": "https://picsum.photos/seed/63zc3/3256/2992",
        "slug": "Computador-Gostoso-de-Concreto",
        "precoCentavos": 83706
    },
    {
        "id": 2,
        "nome": "Toalhas Refinado de Algodão",
        "descricao": "The sleek and preocupado Computador comes with esmeralda LED lighting for smart functionality",
        "imagem": "https://picsum.photos/seed/jNKqvAg/3672/531",
        "slug": "Toalhas-Refinado-de-Algodao",
        "precoCentavos": 1130
    },
    {
        "id": 3,
        "nome": "Salgadinhos Licenciado de Congelado",
        "descricao": "Experience the ouro brilliance of our Salsicha, perfect for salgado environments",
        "imagem": "https://picsum.photos/seed/pjrggSflv/3622/3972",
        "slug": "Salgadinhos-Licenciado-de-Congelado",
        "precoCentavos": 19101
    },
    {
        "id": 4,
        "nome": "Toalhas Fantástico de Algodão",
        "descricao": "The Self-enabling incremental capability Sapatos offers reliable performance and responsável design",
        "imagem": "https://picsum.photos/seed/Ca4dW9wH/2649/2914",
        "slug": "Toalhas-Fantastico-de-Algodao",
        "precoCentavos": 6127
    },
    {
        "id": 5,
        "nome": "Calças Rústico de Madeira",
        "descricao": "Lustroso Mouse designed with Metal for destrutivo performance",
        "imagem": "https://picsum.photos/seed/QbABjzlHq/3524/3873",
        "slug": "Calcas-Rustico-de-Madeira",
        "precoCentavos": 5024094
    },
    {
        "id": 6,
        "nome": "Salgadinhos Refinado de Algodão",
        "descricao": "Professional-grade Mesa perfect for estranho training and recreational use",
        "imagem": "https://picsum.photos/seed/o2xflqb/3307/1202",
        "slug": "Salgadinhos-Refinado-de-Algodao",
        "precoCentavos": 6230304
    },
    {
        "id": 7,
        "nome": "Chapéu Pequeno de Congelado",
        "descricao": "Featuring Meitnerium-enhanced technology, our Frango offers unparalleled fácil performance",
        "imagem": "https://picsum.photos/seed/HOiwchEp/3522/2560",
        "slug": "Chapeu-Pequeno-de-Congelado",
        "precoCentavos": 14309041
    },
    {
        "id": 8,
        "nome": "Bola Lindo de Fresco",
        "descricao": "Innovative Frango featuring quente technology and Metal construction",
        "imagem": "https://picsum.photos/seed/eJpO50hV4/3638/893",
        "slug": "Bola-Lindo-de-Fresco",
        "precoCentavos": 816015
    },
    {
        "id": 9,
        "nome": "Peixe Sem marca de Fresco",
        "descricao": "Stylish Salsicha designed to make you stand out with quieto looks",
        "imagem": "https://picsum.photos/seed/17pAp8MOo/3101/3731",
        "slug": "Peixe-Sem-marca-de-Fresco",
        "precoCentavos": 5740124
    }
]
const items = ref([]);

const search = (event: { originalEvent: InputEvent, query: string }) => {
    setTimeout(() => {
        items.value = data.filter(e => e.nome.toLowerCase().startsWith(event.query.toLowerCase()))
    }, 1000)
    console.log(event, items.value)
}
</script>
<style lang="css" scoped>
.rotate {
    animation: rotate 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

div {
    transition: all 0.5s;
}
</style>