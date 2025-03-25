<template>
  <v-app>
    <NavbarLayout />
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script setup>
import NavbarLayout from "./layouts/NavbarLayout.vue";
</script>
