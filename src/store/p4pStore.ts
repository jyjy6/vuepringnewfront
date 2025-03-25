import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import type { P4P } from "../types/P4PTypes";

export const useP4PStore = defineStore("p4p", () => {
  // 상태 정의
  const loading = ref(false);
  const p4pData = ref<P4P[]>([]);

  // 액션 정의
  const fetchP4PData = async () => {
    loading.value = true; // 로딩 상태 시작
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/p4p`
      );
      p4pData.value = response.data; // 데이터를 상태에 저장
    } catch (error) {
      console.error("Error fetching P4P data:", error);
    } finally {
      loading.value = false; // 로딩 상태 종료
    }
  };

  return {
    loading,
    p4pData,
    fetchP4PData,
  };
});
