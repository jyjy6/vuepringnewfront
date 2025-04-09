import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { ChatMessage } from "../types/ChatTypes";

export interface PaginatedChatResponse {
  items: ChatMessage[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export const useChatStore = defineStore("chat", () => {
  const loading = ref(false);
  const chatData = ref<ChatMessage[]>([]);
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const totalItems = ref(0);
  const totalPages = ref(0);

  const fetchAllChatData = async () => {
    loading.value = true;
    try {
      const response = await axios.get<PaginatedChatResponse>(
        `${import.meta.env.VITE_API_BASE_URL}/api/chat/allchat`,
        {
          params: {
            page: currentPage.value - 1, // Spring은 0부터 시작하는 페이지 인덱스 사용
            size: itemsPerPage.value,
          },
        }
      );

      chatData.value = response.data.items;
      totalItems.value = response.data.totalItems;
      totalPages.value = response.data.totalPages;
    } catch (error) {
      console.error("Error fetching chat data:", error);
    } finally {
      loading.value = false;
    }
  };

  const fetchFilteredChatData = async (status: string) => {
    loading.value = true;
    try {
      const params: Record<string, any> = {
        page: currentPage.value - 1,
        size: itemsPerPage.value,
      };

      // 전체가 아닌 경우에만 상태 필터 추가
      if (status !== 'all') {
        params.status = status;
      }

      const response = await axios.get<PaginatedChatResponse>(
        `${import.meta.env.VITE_API_BASE_URL}/api/chat/allchat`,
        { params }
      );

      chatData.value = response.data.items;
      totalItems.value = response.data.totalItems;
      totalPages.value = response.data.totalPages;
    } catch (error) {
      console.error("Error fetching filtered chat data:", error);
    } finally {
      loading.value = false;
    }
  };

  const setPage = (page: number) => {
    currentPage.value = page;
    fetchAllChatData();
  };

  return {
    loading,
    chatData,
    fetchAllChatData,
    fetchFilteredChatData,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    setPage,
  };
});