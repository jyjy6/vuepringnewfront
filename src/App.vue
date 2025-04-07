<template>
  <v-app style="margin-bottom: 200px">
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
import { nextTick } from "vue";
const loginStore = useLoginStore();
onMounted(() => {
  loginStore.loadUserFromLocalStorage();
  nextTick(() => {
    console.log(loginStore.user);
  });
});
</script>
