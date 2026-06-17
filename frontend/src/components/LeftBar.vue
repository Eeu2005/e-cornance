<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter, } from "vue-router";
import Slider from "@/volt/Slider.vue";
import { useQueryManager } from "@/functions/queryManager.ts";
import { assertNumero } from "@/functions/Number.ts";
import Summary from "./ui/Summary.vue";
import Button from "./ui/Button.vue";
import Stars from "./ui/stars.vue";
import { PhFunnel } from "@phosphor-icons/vue";

const route = useRouter();
const { currentRoute: { value: rotaAtual } } = route
const { updateQuery } = useQueryManager()
const { format } = Intl.NumberFormat("pt-br", { style: "currency", currency: "BRL" })
const minPreco = assertNumero(rotaAtual.query.minPreco, 0)
const maxPreco = assertNumero(rotaAtual.query.maxPreco, 100000)
const tipos = ref(['eletrico', "caixas", "investigar", "curar"])
let tipoSelecionado = ref(route.currentRoute.value.query.tipo ?? "")
const avaliacao = ref(assertNumero(rotaAtual.query.avaliacao, 5))
watch(avaliacao, (avaliacao) => {
    updateQuery({
        avaliacao: String(avaliacao)
    })
})
const preco = ref<number[]>([minPreco, maxPreco]);
watch(preco, ([minPreco, maxPreco]) => {
    updateQuery({
        maxPreco: String(maxPreco ?? 100000),
        minPreco: String(minPreco ?? 0),
    })
});
watch(tipoSelecionado, (tipo) => {
    updateQuery({
        tipo: String(tipo),
    });
});
</script>

<template>
    <div class="bg-electric-violet-200 flex justify-between rounded-xl h-full flex-col gap-2 p-1">
        <h2 class="text-3xl self-center">Filtros</h2>
        <div class="flex gap-2.5 items-center flex-col">
            <Summary label="Preço">
            <template #conteudo>
                <div class="flex flex-col gap-4.5 h-fit mb-3 ">
                    <div class="flex justify-between gap-2.5">
                              <p>{{ format((preco[0] ?? 0) / 100) }}</p>
                            <p>{{ format((preco[1] ?? 0) / 100) }}</p>
  
                    </div>
                <Slider v-model="preco" :max="100000" range pt:startHandler:class="bg-electric-violet-600"
                    pt:endHandler:class="bg-electric-violet-400 " class="
                    self-center
                    justify-self-center
                    w-[calc(100%-20px)]
                    "></Slider>
                </div>
            </template>
        </Summary>
        <Summary label="Tipo">
            <template #conteudo>
                <div class="flex flex-col gap-2.5 items-center">
                    <Button v-for="tipo in tipos" :label="tipo" :focused="tipoSelecionado === tipo"
                        :onclick="() => tipoSelecionado==tipo ?tipoSelecionado='' :tipoSelecionado= tipo"><template #label>{{ tipo }}</template></Button>
                </div>
            </template>
        </Summary>
        <Summary label="Avaliação media">
            <template class="flex justify-center" #conteudo>
                <Stars v-model="avaliacao" :total=5 />
            </template>
        </Summary>
        </div>
        <div class="self-center mt-2 mb-2">
            <Button>
                <template #label>
                    Filtrar
                </template>
                <template #icon>
                    <PhFunnel/>
                </template>
            </Button>
        </div>
    </div>
</template>
