import { defineStore } from "pinia";
import { ref } from "vue";

export const useTestStore = defineStore("main", () => {
  // 상태 정의
  const count = ref(0);

  // 액션 정의
  const increment = () => {
    count.value++;
  };

  return {
    count,
    increment,
  };
});
