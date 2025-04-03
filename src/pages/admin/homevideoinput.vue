<template>
  <h2>홈비디오 입력하는 데임</h2>
  <EditorComponent URL="/api/homevideo/write" :fields="contentFields" />
</template>

<script setup lang="ts">
import EditorComponent from "../../components/EditorComponent.vue";

const contentFields = [
  {
    name: "link",
    label: "YouTube링크",
    type: "text",
    rules: [(v: string) => !!v || "필수 입력입니다."],
  },
];
</script>

<style scoped>
h2 {
  text-align: center;
  margin-top: 50px;
}
</style>
