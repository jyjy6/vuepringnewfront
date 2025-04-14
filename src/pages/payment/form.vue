<template>
  <div class="payment-container">
    <h2>결제하기</h2>

    <div v-if="loading" class="loading">결제 정보를 불러오는 중...</div>

    <div v-else>
      <!-- 카드 요소가 마운트될 div -->
      <div id="card-element" class="card-element"></div>
      <div id="card-errors" class="error-message" role="alert"></div>

      <button @click="processPayment" :disabled="processing" class="pay-button">
        {{ processing ? "처리중..." : "결제하기" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { loadStripe } from "@stripe/stripe-js";
import { useSecureApi } from "../../composables/useSecureApi";

// 상태 변수
const stripe = ref(null);
const elements = ref(null);
const cardElement = ref(null);
const loading = ref(true);
const processing = ref(false);
const error = ref(null);
const api = useSecureApi();

// 주문 정보 (props로 받거나 상태 관리를 통해 가져올 수 있음)
const orderId = ref("ORDER_" + Math.random().toString(36).substring(2, 15));
const amount = ref(100); // 원하는 결제 금액 (예: 100원)

// Stripe 초기화
onMounted(async () => {
  try {
    // Stripe 로드
    stripe.value = await loadStripe("pk_test_your_stripe_publishable_key");

    // 결제 의도(Payment Intent) 생성 요청
    const response = await api.securePost(
      `${import.meta.env.VITE_API_BASE_URL}/api/payments/create-payment-intent`,
      {
        amount: amount.value,
        currency: "krw",
        orderId: orderId.value,
      }
    );

    // Elements 인스턴스 생성
    elements.value = stripe.value.elements({
      clientSecret: response.clientSecret,
    });

    // 카드 요소 생성 및 마운트
    cardElement.value = elements.value.create("card");
    cardElement.value.mount("#card-element");

    // 카드 입력 오류 처리
    cardElement.value.on("change", (event) => {
      const displayError = document.getElementById("card-errors");
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = "";
      }
    });

    // 로딩 완료
    loading.value = false;
  } catch (err) {
    console.error("Stripe 초기화 오류:", err);
    error.value = "결제 시스템을 불러오는데 실패했습니다";
    loading.value = false;
  }
});

// 결제 처리
const processPayment = async () => {
  if (processing.value) return;

  processing.value = true;

  try {
    // 결제 승인
    const result = await stripe.value.confirmPayment({
      elements: elements.value,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success?orderId=${orderId.value}`,
      },
    });

    if (result.error) {
      // 결제 실패 처리
      console.error("결제 오류:", result.error);
      const errorElement = document.getElementById("card-errors");
      errorElement.textContent = result.error.message;
    }
    // 성공 시에는 return_url로 리다이렉트 됨
  } catch (err) {
    console.error("결제 처리 중 오류:", err);
    error.value = "결제 처리 중 오류가 발생했습니다";
  } finally {
    processing.value = false;
  }
};
</script>

<style scoped>
.payment-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.card-element {
  border: 1px solid #e0e0e0;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.error-message {
  color: #ff0000;
  margin-bottom: 15px;
  min-height: 20px;
}

.pay-button {
  background-color: #4caf50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
}

.pay-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 20px;
}
</style>
