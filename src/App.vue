<template>
  <v-app>
    <NavbarLayout />
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script setup>
import { onMounted } from "vue";
import NavbarLayout from "./layouts/NavbarLayout.vue";
import { useLoginStore } from "./store/loginStore";
const loginStore = useLoginStore();
onMounted(() => {
  console.log("발동");
  loginStore.loadUserFromLocalStorage();
});
</script>
