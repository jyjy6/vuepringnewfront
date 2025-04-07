<template>
  <v-container>
    <v-btn
      v-for="(link, index) in links"
      :key="index"
      :to="link.path"
      class="mb-2 w-100"
      color="primary"
      outlined
    >
      {{ link.text }}
    </v-btn>
  </v-container>
  <router-view></router-view>
</template>

<script setup lang="ts">
const links = [
  { text: "복서 데이터 입력하는곳임", path: "/admin/boxerinput" },
  { text: "뉴스 입력하는곳임", path: "/admin/newswrite" },
  { text: "모든 주문 현황", path: "/admin/allorders" },
  { text: "홈 비디오 정보 입력하는곳", path: "/admin/homevideoinput" },
  { text: "샵 아이템 입력하는곳", path: "/admin/shopinput" },
];
</script>

<style scoped>
/* 스타일 추가 가능 */
</style>
