<template>
  <v-container class="cart-container">
    <v-card class="mx-auto pa-4" elevation="3" rounded="lg">
      <v-card-title class="text-h4 font-weight-bold primary--text mb-4">
        <v-icon large color="primary" class="mr-2">mdi-cart</v-icon>장바구니
      </v-card-title>

      <v-divider class="mb-4"></v-divider>

      <v-card-text v-if="cartItems.length === 0" class="text-center py-8">
        <v-icon x-large color="grey lighten-1" class="mb-4"
          >mdi-cart-off</v-icon
        >
        <div class="text-h6 grey--text">장바구니가 비어있습니다</div>
      </v-card-text>

      <template v-else>
        <div class="cart-items">
          <v-slide-y-transition group>
            <v-card
              v-for="(item, index) in cartItems"
              :key="index"
              class="mb-4 cart-item"
              elevation="2"
              rounded="lg"
            >
              <div class="d-flex flex-wrap">
                <div class="item-image-wrapper">
                  <v-img
                    :src="item.img"
                    alt="Product Image"
                    height="120"
                    width="120"
                    class="rounded-lg"
                    cover
                  ></v-img>
                </div>

                <div class="item-details flex-grow-1">
                  <div class="d-flex flex-column h-100 pa-3">
                    <div>
                      <h3 class="text-subtitle-1 font-weight-bold mb-1">
                        {{ item.title }}
                      </h3>
                      <div class="text-body-2 grey--text mb-2">
                        <div>{{ item.size }} / {{ item.color }}</div>
                      </div>
                      <div
                        class="text-subtitle-2 font-weight-bold primary--text"
                      >
                        {{ formatPrice(item.price) }} 원
                      </div>
                    </div>

                    <v-spacer></v-spacer>

                    <div class="d-flex align-center justify-space-between">
                      <v-card class="quantity-control pa-0" flat>
                        <v-btn
                          icon
                          small
                          depressed
                          color="primary"
                          @click="decrementQuantity(item)"
                          :disabled="item.quantity <= 1"
                        >
                          <v-icon small>mdi-minus</v-icon>
                        </v-btn>
                        <span class="mx-2 text-body-1">{{
                          item.quantity
                        }}</span>
                        <v-btn
                          icon
                          small
                          depressed
                          color="primary"
                          @click="incrementQuantity(item)"
                        >
                          <v-icon small>mdi-plus</v-icon>
                        </v-btn>
                      </v-card>

                      <div class="text-subtitle-1 font-weight-bold">
                        {{ formatPrice(item.price * item.quantity) }}원
                      </div>
                    </div>
                  </div>
                </div>

                <div class="remove-btn-wrapper pa-2">
                  <v-btn
                    icon
                    x-small
                    @click="removeItem(index)"
                    class="error--text"
                  >
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </div>
              </div>
            </v-card>
          </v-slide-y-transition>
        </div>

        <v-divider class="my-4"></v-divider>

        <div class="cart-summary pa-2">
          <div class="d-flex justify-space-between align-center">
            <div class="text-subtitle-1">총 상품금액</div>
            <div class="text-h6 font-weight-bold">
              {{ formatPrice(totalPrice) }} 원
            </div>
          </div>

          <div class="d-flex justify-space-between align-center mt-2">
            <div class="text-subtitle-1">배송비</div>
            <div class="text-h6 font-weight-bold">
              {{ formatPrice(shippingFee) }} 원
            </div>
          </div>

          <v-divider class="my-3"></v-divider>

          <div class="d-flex justify-space-between align-center">
            <div class="text-subtitle-1 font-weight-bold">최종 결제금액</div>
            <div class="text-h5 font-weight-bold primary--text">
              {{ formatPrice(totalPrice + shippingFee) }} 원
            </div>
          </div>
        </div>

        <div class="d-flex mt-6">
          <v-btn
            outlined
            large
            color="grey darken-1"
            class="flex-grow-1 mr-2"
            rounded
          >
            <v-icon left>mdi-arrow-left</v-icon>
            쇼핑 계속하기
          </v-btn>
          <v-btn
            large
            color="primary"
            class="flex-grow-1 white--text"
            depressed
            rounded
            to="/order"
          >
            <v-icon left>mdi-credit-card</v-icon>
            주문/결제
          </v-btn>
        </div>
      </template>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useCartStore } from "../store/cartStore";
import { Cart } from "../types/CartTypes";
import axios from "axios";
import { onUnmounted } from "vue";
import { useSecureApi } from "../composables/useSecureApi";

const cartStore = useCartStore();
const cartItems = computed(() => cartStore.cartData);
const shippingFee = ref(0); // 기본 배송비

// 수량 증가
const incrementQuantity = (item: Cart) => {
  item.quantity++;
  updateCart();
};

// 수량 감소
const decrementQuantity = (item: Cart) => {
  if (item.quantity > 1) {
    item.quantity--;
    updateCart();
  }
};

// 아이템 삭제
const removeItem = (index: number) => {
  console.log(cartItems.value[index]);
  const response = api.secureDelete(
    `${import.meta.env.VITE_API_BASE_URL}/api/cart/delete?id=${
      cartItems.value[index].id
    }`
  );
  alert("장바구니에서 삭제됐습니다.");
  const updatedCart = cartItems.value.filter((item, i) => i !== index);
  cartStore.cartData = updatedCart;
  localStorage.setItem("sendingForm", JSON.stringify(updatedCart));
  console.log(updatedCart);
};

// 총 가격 계산
const totalPrice = computed(() => {
  return cartItems.value.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
});

// 가격 포맷팅
const formatPrice = (price: number) => {
  return price.toLocaleString();
};

// 장바구니 업데이트
const updateCart = () => {
  cartItems.value.forEach((item) => {
    item.totalPrice = item.price * item.quantity;
  });
  cartStore.cartData = cartItems.value;
  localStorage.setItem("sendingForm", JSON.stringify(cartItems.value));
};

onMounted(async () => {
  console.log("카트");

  // 안전하게 JSON 파싱
  let savedCart = null;
  const savedCartString = localStorage.getItem("sendingForm");

  if (savedCartString) {
    try {
      savedCart = JSON.parse(savedCartString);
    } catch (e) {
      console.error("JSON 파싱 오류:", e);
      savedCart = null;
    }
  }

  if (savedCart && savedCart.length > 0) {
    cartStore.cartData = savedCart;
  } else {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/cart`
      );
      console.log(response.data);
      cartStore.cartData = response.data;

      // 데이터 저장
      localStorage.setItem("sendingForm", JSON.stringify(response.data));
    } catch (error) {
      console.error("에러남", error);
    } finally {
      console.log(cartStore.cartData);
    }
  }
});

const api = useSecureApi();
onUnmounted(async () => {
  // 장바구니에서 +- 만지고 주문하기로 넘어가거나 다른페이지로 이동하면 DB저장
  // 안전하게 JSON 파싱
  let savedCart = null;
  const savedCartString = localStorage.getItem("sendingForm");
  if (savedCartString) {
    savedCart = JSON.parse(savedCartString);
  }

  try {
    const response = await api.securePost(
      `${import.meta.env.VITE_API_BASE_URL}/api/cart/insert`,
      savedCart
    );
  } catch (error) {
    console.error("에러남", error);
  } finally {
    console.log(cartStore.cartData);
  }
});
</script>

<style scoped>
.cart-container {
  font-family: "Noto Sans KR", sans-serif;
  max-width: 800px;
  margin: 0 auto;
}

.cart-item {
  transition: all 0.3s ease;
  overflow: hidden;
}

.cart-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1) !important;
}

.item-image-wrapper {
  min-width: 120px;
}

.item-details {
  min-width: 250px;
}

.quantity-control {
  display: inline-flex;
  align-items: center;
  border-radius: 20px;
}

@media (max-width: 600px) {
  .item-image-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 16px;
  }

  .item-details {
    width: 100%;
  }
}
</style>
