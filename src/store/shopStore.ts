import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import type { ProductRequest, StoreCart } from "../types/ShopTypes";

export const useShopStore = defineStore("shop", () => {
  const loading = ref(false);
  const shopData = ref<ProductRequest[]>([]);
  const cartContent = ref<StoreCart[]>([]);
  const currentPage = ref(1);
  const itemsPerPage = ref(8);
  const totalItems = ref(0);
  const totalPages = ref(0);

  const fetchShopItemData = async () => {
    loading.value = true;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/sales/items`,
        {
          params: {
            page: currentPage.value,
            size: itemsPerPage.value,
          },
        }
      );

      shopData.value = response.data.items;
      totalItems.value = response.data.totalItems;
      totalPages.value = response.data.totalPages;
    } catch (error) {
      console.error("Error fetching paginated data:", error);
    } finally {
      loading.value = false;
    }
  };

  const setPage = (page: number) => {
    currentPage.value = page;
    fetchShopItemData();
  };

  return {
    loading,
    shopData,
    fetchShopItemData,
    cartContent,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    setPage,
  };
});
