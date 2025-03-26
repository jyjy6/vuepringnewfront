import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import type { P4P } from "../types/P4PTypes";

export const useP4PStore = defineStore("p4p", () => {
  const loading = ref(false);
  const p4pData = ref<P4P[]>([]);

  const fetchP4PData = async () => {
    loading.value = true;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/p4p`
      );
      p4pData.value = response.data;
    } catch (error) {
      console.error("Error fetching P4P data:", error);
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    p4pData,
    fetchP4PData,
  };
});
