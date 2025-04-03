import { defineStore } from "pinia";
import { ref } from "vue";
import { Cart } from "../types/CartTypes";

export const useCartStore = defineStore("cart", () => {
  const cartData = ref<Cart[]>([]);

  return {
    cartData,
  };
});
