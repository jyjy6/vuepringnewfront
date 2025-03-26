import axios from "axios";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useNewsDataStore = defineStore("newsData", () => {
  // 상태 정의
  const loading = ref(false);
  const count = ref(0);
  const newsData = ref([]);

  const fetchNewsData = async () => {
    loading.value = true; // 로딩 상태 시작
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/news/data`
      );
      newsData.value = response.data; // 데이터를 상태에 저장
    } catch (error) {
      console.error("Error fetching P4P data:", error);
    } finally {
      loading.value = false; // 로딩 상태 종료
    }
  };

  return {
    count,
    loading,
    newsData,
    fetchNewsData,
  };
});
