import axios from "axios";
import { defineStore } from "pinia";
import { ref } from "vue";
import { Boxer } from "../types/BoxerTypes";

export const useBoxerDataStore = defineStore("boxerData", () => {
  // 상태 정의
  const loading = ref(false);
  const boxers = ref<Boxer[]>([]);
  const modalOpen = ref(false);

  const fetchboxers = async (division: string) => {
    loading.value = true;
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/boxers?weightClass=${division}`
      );
      boxers.value = response.data;
    } catch (error) {
      console.error("Error fetching boxers:", error);
    } finally {
      loading.value = false;
    }
  };

  const getOneBoxer = async (id: number) => {
    loading.value = true;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/boxers/${id}`
      );
      boxers.value = [response.data];
      console.log("복서정보");
      console.log(boxers.value);
    } catch (error) {
      console.error("Error fetching boxers:", error);
    } finally {
      loading.value = false;
    }
  };

  return {
    boxers,
    loading,
    fetchboxers,
    modalOpen,
    getOneBoxer,
  };
});
