<template>
  <BoxerDataFormComponent :isPut="true" :modifyId="Number(route.params.id)" />
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import BoxerDataFormComponent from "../../components/BoxerDataFormComponent.vue";
const route = useRoute();
</script>

<style></style>
