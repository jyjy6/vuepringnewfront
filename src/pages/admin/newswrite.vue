<script setup lang="ts">
import EditorComponent from "../../components/EditorComponent.vue";

console.log(import.meta.env.VITE_API_BASE_URL);
</script>

<template>
  <h2>뉴스라이트임</h2>
  <EditorComponent URL="/api/news/post" />
</template>

<style scoped></style>
