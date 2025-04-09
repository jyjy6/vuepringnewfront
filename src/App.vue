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
import { useSecureApi } from "./composables/useSecureApi";
const loginStore = useLoginStore();
const api = useSecureApi();
onMounted(() => {
  loginStore.loadUserFromLocalStorage();
  nextTick(() => {
    console.log(loginStore.user);
  });

  //csrf토큰 초기발행
  if (!document.cookie.includes("XSRF-TOKEN")) {
    api.fetchCsrfToken();
    console.log("토큰발행1");
  }
  console.log("토큰발행2");
});
</script>
