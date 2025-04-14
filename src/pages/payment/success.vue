<template>
  <div class="success-container">
    <h2>결제가 완료되었습니다!</h2>
    <p>주문 번호: {{ orderId }}</p>
    <p>결제 ID: {{ paymentId }}</p>
    
    <div class="action-buttons">
      <button @click="goToOrders" class="primary-button">주문 내역 보기</button>
      <button @click="goToHome" class="secondary-button">홈으로 돌아가기</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const orderId = ref('');
const paymentId = ref('');
const loading = ref(true);

onMounted(async () => {
  // URL에서 파라미터 추출
  const urlParams = new URLSearchParams(window.location.search);
  orderId.value = urlParams.get('orderId');
  const paymentIntentId = urlParams.get('payment_intent');
  
  if (paymentIntentId && orderId.value) {
    try {
      // 결제 확인 요청
      const response = await api.securePost(
        `${import.meta.env.VITE_API_BASE_URL}/api/payments/confirm`,
        {
          paymentIntentId,
          orderId: orderId.value
        }
      );
      
      if (response.success) {
        paymentId.value = paymentIntentId;
      } else {
        console.error('결제 확인 실패:', response.message);
      }
    } catch (err) {
      console.error('결제 확인 중 오류:', err);
    } finally {
      loading.value = false;
    }
  }
});

const goToOrders = () => {
  router.push('/orders');
};

const goToHome = () => {
  router.push('/');
};
</script>

<style scoped>
.success-container {
  max-width: 600px;
  margin: 50px auto;
  padding: 30px;
  text-align: center;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.action-buttons {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.primary-button, .secondary-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.primary-button {
  background-color: #4caf50;
  color: white;
}

.secondary-button {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}
</style>