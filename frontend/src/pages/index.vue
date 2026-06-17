<script setup lang="ts">
import LeftBar from "@/components/LeftBar.vue";
import TopBar from "@/components/TopBar.vue";
</script>

<template>
    <TopBar/>
<div class="flex gap-1.5 h-dvh">
    <LeftBar/>
    <div class="w-full rounded-xl h-full bg-electric-violet-100"></div>
</div>
</template>

<style scoped></style>
