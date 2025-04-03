<template>
  <div class="order-form-container">
    <h1 class="order-title">주문서 작성</h1>

    <form @submit.prevent="submitOrder" class="order-form">
      <!-- 이름 입력 -->
      <div class="form-group">
        <label for="name" class="form-label">받으실 분</label>
        <input
          v-model="orderer"
          type="text"
          id="name"
          placeholder="받으실 분 이름을 입력하세요"
          required
          class="form-input"
        />
      </div>

      <!-- 주소 입력 -->
      <div class="form-group">
        <label for="address" class="form-label">주소</label>
        <input
          v-model="address"
          type="text"
          id="address"
          placeholder="클릭하여 주소를 검색!"
          readonly
          @click="openAddressSearch"
          required
          class="form-input address-input"
        />
      </div>

      <!-- 세부 주소 입력 필드 -->
      <div class="form-group">
        <label for="detailedAddress" class="form-label">상세주소</label>
        <input
          v-model="detailedAddress"
          type="text"
          id="detailedAddress"
          placeholder="상세주소를 입력하세요( 102호, 2층 오른쪽 등등)"
          required
          class="form-input"
        />
      </div>

      <!-- 폰번호 입력 -->
      <div class="form-group">
        <label for="phoneNumber" class="form-label">전화번호</label>
        <input
          v-model="phoneNumber"
          type="text"
          id="phoneNumber"
          placeholder="'-'없이 휴대폰번호 11자리 ex)01012345678"
          required
          class="form-input"
        />
      </div>

      <div class="cart-container">
        <h2 class="cart-title">주문목록</h2>
        <div class="cart-items">
          <div
            class="cart-item"
            v-for="(item, index) in cartItems"
            :key="index"
          >
            <div class="item-details">
              <img :src="item.img" alt="Product Image" class="item-image" />
              <div class="item-info">
                <h3 class="item-title">{{ item.title }}</h3>
                <p class="item-price">{{ formatPrice(item.price) }} 원</p>
                <div class="quantity-controls">
                  <span class="item-quantity">{{ item.quantity }}개</span>
                </div>
              </div>
            </div>
            <div class="item-summary">
              <p class="item-options">
                <span class="option-label">선택옵션</span><br />
                {{ item.size }}<br />{{ item.color }}
              </p>
              <p class="item-total">
                <strong
                  >합계 {{ formatPrice(item.price * item.quantity) }}원</strong
                >
              </p>
            </div>
          </div>
        </div>
        <div class="cart-summary">
          <h3 class="total-price">총 합계: {{ formatPrice(totalPrice) }} 원</h3>
          <button type="submit" class="checkout-btn">주문하기</button>
        </div>
      </div>
    </form>

    <!-- 카카오 주소 검색 팝업 -->
    <div v-if="showAddressPopup" class="address-popup" style="display: none">
      <iframe src="" @load="loadAddressApi"> </iframe>
    </div>
  </div>
</template>
<script setup lang="ts">
import axios from "axios";
import { computed, onMounted, ref } from "vue";
import { StoreCart } from "../types/ShopTypes";
import { useSecureApi } from "../composables/useSecureApi";

const cartItems = ref<StoreCart[]>();

const totalPrice = computed(() => {
  return cartItems.value?.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
});
const formatPrice = (price: any) => {
  if (!price) return "0"; // price가 undefined/null이면 기본값 반환
  return price.toLocaleString();
};

onMounted(() => {
  const savedCart = localStorage.getItem("sendingForm");
  console.log(savedCart);

  if (savedCart) {
    try {
      cartItems.value = JSON.parse(savedCart);
    } catch (error) {
      console.error("JSON 파싱 에러:", error);
      cartItems.value = [];
    }
  } else {
    cartItems.value = []; // 기본값 설정
  }
});

// 주문 폼 데이터 (TypeScript로 선언)
const orderer = ref<string>("");
const address = ref<string>("");
const detailedAddress = ref(""); // 세부 주소 필드
const phoneNumber = ref<string>("");
const showAddressPopup = ref(false);

// 주소 검색 팝업 열기
const openAddressSearch = () => {
  showAddressPopup.value = true;
};

// 주소 검색 팝업 닫기
const closeAddressSearch = () => {
  showAddressPopup.value = false;
};

// 카카오 주소 API 로드 (여기서는 설명용으로 URL 예시를 넣음)
const loadAddressApi = () => {
  const element = document.createElement("script");
  element.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
  document.body.appendChild(element);

  element.onload = () => {
    // @ts-ignore
    new window.daum.Postcode({
      oncomplete: function (data: any) {
        address.value = data.address;
        closeAddressSearch();
      },
      // 이 부분에서 설명창 및 UI 요소를 비활성화합니다
      userGrid: false, // 사용자 맞춤 그리드 활성화
      // 기타 설정을 추가할 수 있습니다
    }).open();
  };
};

console.log(cartItems.value);

const api = useSecureApi();
// 폼 제출 처리
const submitOrder = async () => {
  const orderData = {
    orderer: orderer.value,
    address: address.value + " " + detailedAddress.value,
    phoneNumber: phoneNumber.value,
    cartItems: cartItems.value,
  };

  console.log(orderData);
  try {
    const response = await api.securePost(
      `${import.meta.env.VITE_API_BASE_URL}/api/orders`,
      orderData
    );
    console.log(response);
    localStorage.removeItem("sendingForm");
  } catch (error) {
    console.error("Purchase error:", error);
  }

  // 초기화
  orderer.value = "";
  address.value = "";
  phoneNumber.value = "";
};
</script>

<!-- 1.일단 주문한거 다 POST요청해서 DB에저장 
        2. 주문자 마이페이지에 DB에 저장했던 정보들 죄다 데이터바인딩해서 보여주고 배송 상황까지 보여줌
            2-1 주문자가 마이페이지에서 반품요청, 구매확정 등을 누를 수 있게해줌.<template>
            2-1-1 구매확정같은경우에 배달원이 배송완료하고나서 1주일 후면 자동으로 구매(확정)완료로 변경.
            2-2 반품요청시 반품사유폼을 작성해서 서버에보내게하고 서버에서는 그걸받아서 DB에 저장한다음 다시 운영자페이지같은데에
                보여주게 함. 알림도가게해야함. 
            2-3 반품완료했을시 결제된거 취소까지 해줘야함. 이건 뭐 결제 API알아봐야할듯 무통장입금시 역입금도
        3-1 구매완료(확정)됐을 시 구매자한테 포인트같은것도 적립시켜줘야함
  -->
<!-- 
    1. 결제시 PG사 API써서 구현
    무통장, 계좌이체, 카드 선택지 주고 무통장이면 걍 넘기고 주문완료(1)<- 로 변경해주고
    계좌이체,카드는 PG사에서 확인받으면 결제완료(2)로 바꿈
    뭐 택배사든 뭐든 연결되면 배송시작(3)으로 바꾸고
    택배사가 배송완료하면 배송완료(4)로 바꿈

    가끔가다 반품진행(5), 반품완료(6)이 있을 수 있음.

  -->

<style scoped>
/* 전체 컨테이너 스타일 */
.order-form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: "Noto Sans KR", sans-serif;
}

/* 타이틀 스타일 */
.order-title {
  color: #333;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  font-weight: 600;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 1rem;
}

/* 폼 그룹 스타일 */
.form-group {
  margin-bottom: 1.5rem;
}

/* 라벨 스타일 */
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
}

/* 입력 필드 스타일 */
.form-input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus {
  border-color: #4a90e2;
  outline: none;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
}

.form-input::placeholder {
  color: #aaa;
}

/* 주소 입력 필드 특별 스타일 */
.address-input {
  background-color: #f9f9f9;
  cursor: pointer;
}

/* 장바구니 컨테이너 스타일 */
.cart-container {
  margin-top: 2.5rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
}

.cart-title {
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.8rem;
}

/* 장바구니 아이템 스타일 */
.cart-items {
  margin-bottom: 1.5rem;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.2rem;
  padding-bottom: 1.2rem;
  border-bottom: 1px solid #eee;
}

.cart-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.item-details {
  display: flex;
  align-items: center;
  flex: 2;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  margin-right: 1rem;
  border: 1px solid #eee;
}

.item-info {
  flex: 1;
}

.item-title {
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.item-price {
  color: #666;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.item-quantity {
  font-size: 0.9rem;
  color: #555;
}

/* 아이템 요약 스타일 */
.item-summary {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: right;
  font-size: 0.9rem;
}

.item-options {
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.option-label {
  color: #888;
  font-weight: 500;
}

.item-total {
  margin: 0;
  color: #333;
}

/* 장바구니 요약 스타일 */
.cart-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 2px solid #eee;
}

.total-price {
  font-size: 1.2rem;
  color: #333;
  margin: 0;
}

/* 주문 버튼 스타일 */
.checkout-btn {
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.checkout-btn:hover {
  background-color: #3a7bc8;
}

/* 모바일 대응 */
@media (max-width: 768px) {
  .order-form-container {
    padding: 1.5rem;
  }

  .cart-summary {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .total-price {
    text-align: center;
  }

  .checkout-btn {
    width: 100%;
  }

  .cart-item {
    flex-direction: column;
  }

  .item-details {
    margin-bottom: 1rem;
  }

  .item-summary {
    text-align: left;
  }
}
</style>
