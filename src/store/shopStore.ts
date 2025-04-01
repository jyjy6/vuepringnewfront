import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import type { ProductRequest, StoreCart } from "../types/ShopTypes";

export const useShopStore = defineStore("shop", () => {
  const loading = ref(false);
  const shopData = ref<ProductRequest[]>([]);
  const cartContent = ref<StoreCart[]>([]);

  const fetchShopItemData = async () => {
    loading.value = true;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/sales/allitems`
      );
      shopData.value = response.data;
    } catch (error) {
      console.error("Error fetching ItemData:", error);
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    shopData,
    fetchShopItemData,
    cartContent,
  };
});
