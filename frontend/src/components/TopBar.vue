<template>
    <div class="flex p-3.5 justify-between ease-in-out transition duration-300 shadow-2xs inse">
        <RouterLink to="/">
            <logoClaro class="w-10" height="NAN" width="NAN" />
        </RouterLink>

        <SearchBar></SearchBar>
        <User class="w-10" width="NAN" height="NAN" />
    </div>
</template>

<script setup="ts">
import User from "@/assets/user.svg?component"
import logoClaro from '@/assets/logoClaro.svg?component'
import SearchBar from "./searchBar.vue";

</script>