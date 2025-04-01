<template>
  <div v-if="currentItem" class="shop-container">
    <div class="shop-product-detail">
      <div class="shop-product-img">
        <img :src="currentItem.fileURLs[mouseoverdImage]" />
        <div class="preview-container">
          <!-- 이미지 클릭 시 확대 기능 -->
          <img
            v-for="(fileURL, index) in currentItem.fileURLs"
            :src="currentItem.fileURLs[index]"
            :key="index"
            class="image-preview"
            @click="openModal(fileURL)"
            @mouseover="mouseoverdImage = index"
          />
        </div>
        <!-- 모달 -->
        <div v-show="isModalOpen" class="modal" @click="closeModal">
          <div class="modal-content">
            <img
              :src="selectedImage"
              alt="Expanded Image"
              class="modal-image"
            />
          </div>
        </div>
      </div>

      <div>
        <a href="http://localhost:8080/testing">테스트 페이지로 이동</a>
      </div>

      <div class="shop-product-options">
        <h4>{{ currentItem.name }}</h4>
        <span class="shop-price">{{
          Intl.NumberFormat().format(currentItem.price)
        }}</span>
        <span class="shop-shipping">{{
          currentItem.shippingInfo[0].freeShipping
            ? "무료배송"
            : "배송비 2500원"
        }}</span>
        <div class="shop-benefit">
          <h4>복싱천재 고객을 위한 혜택</h4>
          <div class="shop-point-infobox">
            <span>최대 적립 포인트</span>
            <span>21,630원</span>
          </div>
          <div class="shop-point-infobox">
            <span>기본적립</span>
            <span
              >{{
                Intl.NumberFormat().format(currentItem.price * 0.01)
              }}원</span
            >
          </div>
          <div class="shop-point-infobox">
            <span>네이버페이 머니 결제 시 최대 적립></span>
            <span
              >{{
                Intl.NumberFormat().format(currentItem.price * 0.02)
              }}원</span
            >
          </div>
        </div>
        <div class="shop-point-quit-img">
          <img
            src="https://shop-phinf.pstatic.net/20240709_265/1720510596693nBQmb_PNG/1100x12628pc29.png"
            alt=""
          />
        </div>
        <div class="shop-point-infobox2">
          <span>복수구매할인</span>
          <span>&nbsp; 2개 이상 구매시 10,000원 추가할인</span>
        </div>
        <div class="parcel-wrapper">
          <div class="divider"></div>
          <div v-if="isDuringDay" class="shop-benefit">
            <div>
              <span>오늘출발 상품</span>
              <p>{{ timeLeft }} 내에 결제시 오늘 바로 발송됩니다.</p>
            </div>
          </div>
          <div class="parcel-container">
            <span>{{ currentItem.shippingInfo[0].type }}&nbsp;|&nbsp;</span>
            <span
              >{{
                currentItem.shippingInfo[0].freeShipping
                  ? "무료배송"
                  : "배송비 2500원"
              }}, 우체국택배</span
            >
            <p>
              제주/도서산간
              {{
                Intl.NumberFormat().format(
                  currentItem.shippingInfo[0].islandAdditionalFee
                )
              }}원
            </p>
          </div>
          <div class="divider"></div>
        </div>

        <div class="option-select-box">
          <h3>옵션선택</h3>
          <select name="size" id="size" v-model="selectedSize">
            <option disabled value="" selected>옵션을 선택하세요</option>
            <!-- 비활성화된 기본 옵션 추가 -->
            <option v-for="size in uniqueSizes" :key="size" :value="size">
              {{ size }}
            </option>
          </select>

          <select
            name="color"
            id="color"
            v-if="filteredColors.length > 0"
            v-model="selectedColor"
            @change="updateQuantity"
          >
            <option disabled value="" selected>옵션을 선택하세요</option>
            <!-- 비활성화된 기본 옵션 추가 -->
            <option v-for="color in filteredColors" :key="color" :value="color">
              {{ color }}
            </option>
          </select>
          <div class="divider"></div>
        </div>

        <!-- 여기에 선택옵션 추가 -->
        <div class="selected-options">
          <h2>선택한 옵션</h2>
          <div class="option-cards">
            <div
              class="option-card"
              v-for="(item, index) in sendingForm"
              :key="index"
            >
              <div class="option-details">
                <p><strong>사이즈:</strong> {{ item.size }}</p>
                <p><strong>색상:</strong> {{ item.color }}</p>

                <div class="quantity-controls">
                  <div class="quantity-btn">
                    <button
                      @click="decrementQuantity(item)"
                      :disabled="quantity <= 0"
                    >
                      -
                    </button>
                    <p>수량: {{ item.quantity }}</p>
                    <button @click="incrementQuantity(item)">+</button>
                  </div>
                  <p>
                    가격:
                    {{ Intl.NumberFormat().format(item.price * item.quantity) }}
                    원
                  </p>
                </div>
                <!-- <p><strong>주문자:</strong> {{ item.orderUser }}</p> -->
              </div>
              <div class="remove-button" @click="removeOption(index)">
                ❌ 제거
              </div>
            </div>
          </div>
        </div>

        <div class="total-payment">
          <div class="shop-point-infobox">
            <span>총 상품 금액</span>
            <span>{{ Intl.NumberFormat().format(totalPrice) }}원</span>
          </div>
        </div>
        <!-- 총상품금액 바인딩 -->

        <div class="button-box">
          <div class="top-buttons">
            <button>선물하기</button>
            <button>구매하기</button>
          </div>
          <div class="bottom-buttons">
            <button>문의</button>
            <button>찜하기</button>
            <button @click="saveSendingForm">
              <i class="fas fa-shopping-cart"></i> 장바구니
            </button>
          </div>
        </div>
      </div>
    </div>

    <table class="table-info">
      <tr>
        <th>상품번호</th>
        <td>{{ currentItem.id }}</td>
        <th>상품상태</th>
        <td>{{ currentItem.condition }}</td>
      </tr>
      <tr>
        <th>제조사</th>
        <td>{{ currentItem.manufacturer }}</td>
        <th>브랜드</th>
        <td>{{ currentItem.brand }}</td>
      </tr>
      <tr>
        <th>모델명</th>
        <td>{{ currentItem.name }}</td>
        <th>이벤트</th>
        <td>
          구매만 해도 네이버페이 포인트 지급! 리뷰 작성 네이버페이 포인트 지급!
        </td>
      </tr>
      <tr>
        <th>원산지</th>
        <td colspan="4">{{ currentItem.origin }}</td>
      </tr>
    </table>

    <table class="table-info">
      <tr>
        <th>종류</th>
        <td>백글러브</td>
        <th>소재</th>
        <td>인조가죽</td>
      </tr>
      <tr>
        <th>색상</th>
        <td>옵션 선택 참조</td>
        <th>부가기능</th>
        <td>옵션 선택 참조</td>
      </tr>
    </table>

    <table class="table-info">
      <tr>
        <th>영수증발급</th>
        <td>신용카드전표,현금영수증발급</td>
      </tr>
      <tr>
        <th>A/S 안내</th>
        <td><span>상세정보확인</span></td>
      </tr>
    </table>

    <div class="grade-benefit" style="position: relative; z-index: -1">
      <div v-for="(dc, i) in currentItem.discounts" :key="i">
        <span class="grade-name">&nbsp; {{ dc.grade }}</span>
        <span>{{ dc.discountRate }}% 할인</span>
      </div>
    </div>

    <div class="test"></div>
    <!-- 센딩폼 -->
    <div v-for="form in sendingForm" :key="form">
      <span>{{ form }}</span>
    </div>
  </div>
  <div v-else class="spinner-overlay"><div class="spinner"></div></div>

  <button @click="check">센딩폼 밸류 확인하는버튼임</button>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useShopStore } from "../store/shopStore";
import { ProductRequest, ShopOption } from "../types/ShopTypes";
import { ComputedRef } from "vue";
import { useLoginStore } from "../store/loginStore";

// ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ남은시간 계산 로직ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

const timeLeft = ref(""); // 카운트다운 타이머를 저장할 ref
const isDuringDay = ref(false); // 00시부터 15시까지 여부를 저장할 ref
let timer: number | undefined; // 타이머 ID를 저장할 변수
const calculateTimeLeft = () => {
  const now = new Date();
  const deadline = new Date();
  deadline.setHours(15, 0, 0, 0); // 오늘 15시로 설정

  if (now > deadline) {
    // 현재 시간이 15시를 넘었을 때
    deadline.setDate(deadline.getDate() + 1); // 다음 날 15시로 설정
  }

  const timeDiff = deadline.getTime() - now.getTime(); // 남은 밀리초 계산

  const hours = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  timeLeft.value = `${formattedHours}:${formattedMinutes}:${formattedSeconds}초`;

  // 현재 시간이 00시부터 15시까지인지 확인
  isDuringDay.value = now.getHours() >= 0 && now.getHours() < 15;
};

onMounted(() => {
  calculateTimeLeft(); // 컴포넌트가 마운트되었을 때 초기 카운트다운 계산
  timer = window.setInterval(calculateTimeLeft, 1000); // 매초 타이머를 업데이트
});

onUnmounted(() => {
  if (timer !== undefined) {
    window.clearInterval(timer); // 컴포넌트가 언마운트될 때 타이머 정리
  }
});
// ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ남은시간계산로직끝ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

const router = useRouter();
const route = useRoute();
const shopStore = useShopStore();
const currentItem: ComputedRef<any> = computed(() => {
  const id = route.params.id;
  // id가 문자열인지 확인하고, 그렇지 않으면 NaN을 반환
  const parsedId = Array.isArray(id) ? NaN : parseInt(id);
  return shopStore.shopData.find((item) => item.id === parsedId);
});

// 선택된 사이즈와 컬러
const selectedSize = ref("M");
const selectedColor = ref("");
const uniqueSizes = computed<string[]>(() => {
  if (!currentItem.value) return []; // currentItem이 null일 경우 빈 배열 반환
  // Set을 사용하여 중복된 사이즈 제거
  const sizes = currentItem.value.options.map((opt: ShopOption) => opt.size);
  return Array.from(new Set(sizes)); // Set을 배열로 변환하여 반환
});

// 사이즈별로 표시할 색상 옵션들
// filteredColors computed 속성
const filteredColors = computed<string[]>(() => {
  if (!currentItem.value) return []; // currentItem이 null일 경우 빈 배열 반환

  // selectedSize에 해당하는 모든 색상 필터링
  return currentItem.value.options
    .filter((opt: ShopOption) => opt.size === selectedSize.value) // 사이즈가 일치하는 옵션 필터링
    .map((opt: ShopOption) => opt.color); // 필터링된 옵션에서 색상만 추출
});

const mouseoverdImage = ref(0);
const isModalOpen = ref(false);
const selectedImage = ref("");
const openModal = (fileURL: string) => {
  selectedImage.value = fileURL;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};
// ESC 키 눌렀을 때 모달 닫기
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    isModalOpen.value = false;
  }
};
onMounted(() => {
  window.addEventListener("keydown", handleKeydown); // 키보드 이벤트 리스너 등록
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown); // 컴포넌트가 사라질 때 리스너 해제
});

// 장바구니 관련ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
const quantity = ref(0);
const totalPrice = computed(() => {
  let total = 0;
  for (let index = 0; index < sendingForm.value.length; index++) {
    total += sendingForm.value[index].quantity * sendingForm.value[index].price;
  }
  return total;
});

interface shopForm {
  size: string;
  color: string;
  quantity: number;
  price: number;
  orderUser: string;
  totalPrice: number;
  img: string;
  title: string;
}

const sendingForm = ref<any>([]);

const loginStore = useLoginStore();

const updateQuantity = () => {
  // form 객체를 매번 새로 생성
  const form: shopForm = {
    size: selectedSize.value,
    color: selectedColor.value,
    price: currentItem.value.price,
    quantity: quantity.value,
    orderUser: loginStore.user?.username as string,
    totalPrice: 0,
    img: currentItem.value.fileURLs[0],
    title: currentItem.value.name,
  };

  if (form.size && form.color) {
    // 같은옵션인지 확인하는 for문 같은옵션이면 수량만증가
    for (let index = 0; index < sendingForm.value.length; index++) {
      if (
        sendingForm.value[index].size === form.size &&
        sendingForm.value[index].color === form.color
      ) {
        sendingForm.value[index].quantity++;
        sendingForm.value[index].totalPrice =
          sendingForm.value[index].price * sendingForm.value[index].quantity; // totalPrice 업데이트
        selectedSize.value = "";
        selectedColor.value = "";
        quantity.value = 0;
        return;
      }
    }

    // 같은옵션이 아니면 아래 코드 실행해서 선택한옵션 추가
    quantity.value += 1;
    form.quantity = quantity.value; // 현재 수량 업데이트
    form.totalPrice = form.price * form.quantity; // totalPrice 계산 후 업데이트
    sendingForm.value.push(form); // form을 sendingForm에 추가

    // 선택된 사이즈와 색상을 초기화
    selectedSize.value = "";
    selectedColor.value = "";
    quantity.value = 0;
  }
};

const removeOption = (index: number) => {
  sendingForm.value.splice(index, 1); // 해당 인덱스의 옵션 제거
};

function incrementQuantity(item: shopForm) {
  item.quantity += 1; // item의 수량을 증가
  item.totalPrice = item.price * item.quantity; // totalPrice 재계산
}
function decrementQuantity(item: shopForm) {
  if (item.quantity > 0) {
    item.quantity -= 1; // item의 수량을 감소
    item.totalPrice = item.price * item.quantity; // totalPrice 재계산
  }
}

const check = () => {
  console.log(sendingForm.value[0]);
};

const saveSendingForm = () => {
  // 기존의 장바구니 데이터를 가져옵니다.
  const existingCartDataString = localStorage.getItem("sendingForm");
  // 기존 데이터가 null인 경우 빈 배열로 초기화
  const existingCartData = existingCartDataString
    ? JSON.parse(existingCartDataString)
    : [];

  // sendingForm.value 요소의 타입을 지정하여 itemsToRemove를 초기화
  const itemsToRemove: (typeof sendingForm.value)[number][] = []; // sendingForm.value의 요소 타입으로 지정

  for (let i = 0; i < existingCartData.length; i++) {
    for (let j = 0; j < sendingForm.value.length; j++) {
      if (
        existingCartData[i].size === sendingForm.value[j].size &&
        existingCartData[i].color === sendingForm.value[j].color
      ) {
        // 수량 증가
        existingCartData[i].quantity += sendingForm.value[j].quantity;
        existingCartData[i].totalPrice =
          existingCartData[i].quantity * existingCartData[i].price;

        // 해당 요소를 제거할 리스트에 추가
        itemsToRemove.push(sendingForm.value[j]);
      }
    }
  }

  // itemsToRemove에 포함되지 않은 요소들만 sendingForm.value에 남기기
  sendingForm.value = sendingForm.value.filter(
    (item: shopForm) => !itemsToRemove.includes(item)
  );

  // 새로운 상품을 추가하기 전에 기존 데이터와 병합
  existingCartData.push(...sendingForm.value);

  // 로컬스토리지에 업데이트된 장바구니 데이터를 저장합니다.
  localStorage.setItem("sendingForm", JSON.stringify(existingCartData));

  shopStore.cartContent = existingCartData;

  if (confirm("장바구니로 이동하시겠습니까?")) {
    router.push("/cart");
  }
  sendingForm.value = [];
};

/* 장바구니



*/
</script>

<style scoped>
.shop-container {
  margin: 0 auto;
  padding-top: 50px;
  width: 80%;
}
.shop-product-detail {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
}
.shop-product-options {
  display: flex;
  width: 40%;
  flex-direction: column;
  align-items: flex-end;
}
.shop-product-img {
  width: 40%;
  position: sticky;
  top: 50px;
}
.shop-product-img > img {
  width: 100%;
}

.preview-container {
  display: flex;
  justify-content: center;
  margin: 0 auto;
  width: 100px;
  height: 100px;
}

.image-preview {
  width: 100px;
  height: 100px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s;
}

.image-preview:hover {
  transform: scale(1.1);
}

/* 모달창 스타일 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8); /* 반투명 배경 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 80vw;
  max-height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  z-index: 1001;
}

.modal-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 5px;
  transition: transform 0.3s;
  z-index: 99;
}

/* 모달 이미지 확대 효과 */
.modal-image:hover {
  transform: scale(1.1);
}

.shop-price {
  color: rgb(255, 94, 94);
  font-size: 1.2rem;
  font-weight: bold;
}
.shop-shipping {
  color: rgb(197, 197, 197);
  margin-top: 3px;
  font-size: 0.8rem;
}
.shop-benefit {
  box-sizing: border-box;
  width: 100%;
  border: 1px solid lightgrey;
  align-self: center;
  margin-top: 20px;
  padding: 20px;
}
.shop-benefit > h4 {
  margin-top: 0;
}
.shop-point-infobox2,
.shop-point-infobox {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  margin-top: 15px;
}
.shop-point-infobox2 {
  width: 100%;
  justify-content: space-evenly;
}

.shop-point-infobox2 span {
  position: relative;
  padding: 0 10px; /* Span 사이에 여백 추가 */
  z-index: 0;
}

.shop-point-infobox2 span:not(:last-child)::after {
  content: "|"; /* 구분선 */
  position: absolute;
  right: -10px; /* 구분선과 span 사이의 간격 조절 */
  top: 40%;
  transform: translateY(-50%);
  color: #000; /* 구분선 색상 */
  z-index: 11;
}

.shop-point-quit-img {
  width: 100%;
  background-color: #192346;
  margin-top: 10px;
}
.shop-point-quit-img img {
  width: 95%;
  margin-left: auto;
  display: block;
}
.parcel-wrapper {
  width: 100%;
}
.parcel-container {
  margin-top: 10px;
  align-self: flex-start;
}
.parcel-container p {
  margin: 0;
  margin-top: 3px;
}
.divider {
  border-top: 1px solid #d3d3d3; /* 연한 회색 */
  margin: 20px 0; /* 위아래 여백 */
}
.option-select-box {
  width: 100%;
}
.option-select-box > select {
  display: block;
  width: 100%;
  margin-top: 5px;
  height: 30px;
}

.selected-options {
  box-sizing: border-box;
  width: 100%;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.option-cards {
  box-sizing: border-box;
  display: flex;
  flex-direction: column; /* 수직 정렬로 변경 */
  gap: 16px;
  width: 100%;
}

.option-card {
  box-sizing: border-box;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  width: 100%; /* 카드 너비를 100%로 설정 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.option-card:hover {
  transform: scale(1.02); /* 약간의 크기 변화 */
}

.option-details p {
  margin: 5px 0;
  font-size: 14px;
}

.quantity-controls {
  display: flex; /* 버튼과 수량을 가로로 나열 */
  justify-content: space-around;
  align-items: center;
}
.quantity-btn {
  display: flex;
  justify-content: center;
}
.quantity-controls p {
  font-size: 1.1rem;
}
@media screen and (max-width: 1250px) {
  .quantity-controls p {
    font-size: 1rem;
  }
}

@media screen and (max-width: 1000px) {
  .quantity-controls p {
    font-size: 0.8rem;
  }
}

.quantity-controls button {
  padding: 5px 10px;
  margin: 0 5px;
}

.remove-button {
  margin-top: 10px;
  cursor: pointer;
  color: #ff4d4d; /* 제거 버튼 색상 */
  text-align: center;
  border: none;
  background: none;
}

.total-payment {
  width: 100%;
}
.total-payment .shop-point-infobox:nth-last-of-type(1) > span {
  font-size: 1.4rem;
  font-weight: bold;
}
.button-box {
  margin-top: 30px;
  box-sizing: border-box;
  width: 100%; /* 상자의 너비 */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 5px;
}

.top-buttons {
  display: flex;
  flex-direction: column; /* 세로 정렬 */
  gap: 10px; /* 버튼 사이 간격 */
}
.bottom-buttons {
  display: flex;
  justify-content: space-between; /* 버튼을 좌우에 배치 */
  gap: 5px; /* 버튼 사이 간격 */
}

/* 위쪽 버튼 스타일 */
.top-buttons button {
  width: 100%;
  padding: 15px;
  background-color: #00de5a;
  color: black;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 약간의 그림자 */
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.top-buttons button:hover {
  background-color: #00de5a; /* 어두운 파란색 */
  transform: translateY(-2px); /* 살짝 올라오는 효과 */
}

/* 아래쪽 버튼 스타일 */
.bottom-buttons button {
  flex: 1;
  margin-top: 10px;
  padding: 10px;
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.bottom-buttons button:hover {
  background-color: #e9ecef; /* 밝은 회색 */
  transform: translateY(-2px); /* 살짝 올라오는 효과 */
}
.table-info {
  margin: 0 auto;
  width: 100%; /* 테이블 너비를 80%로 조정 (너비는 상황에 따라 조정 가능) */
  border-collapse: collapse;
  font-family: "Arial", sans-serif; /* 깔끔한 폰트 적용 */
  margin-top: 50px;
}
.table-info:first-of-type {
  margin-top: 150px;
}

.table-info th,
.table-info td {
  padding: 15px 20px;
  border-bottom: 1px solid lightgray; /* 상하단만 경계선 */
  text-align: left; /* 좌측 정렬 */
}

.table-info th {
  background-color: #f8f9fa; /* 연한 배경색으로 구분 */
  font-weight: bold;
  color: #333; /* 폰트 색상 */
  font-size: 0.8rem;
}

.table-info td {
  color: #555; /* 텍스트 색상을 살짝 어둡게 */
  font-size: 0.8rem;
}

.table-info tr:first-child {
  border-top: 1px solid lightgray; /* 상하단만 경계선 */
}

.table-info tr td[colspan] {
  text-align: left; /* colspan 있는 행의 텍스트도 왼쪽 정렬 */
  font-weight: normal;
  color: #555;
}

.grade-benefit {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
.grade-benefit > div {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100px;
  width: 30%;
  text-align: center;
  border: 0.5px lightgrey solid;
  font-weight: bold;
  line-height: 22px;
  background-color: rgb(243, 243, 243);
  border-collapse: collapse;
}
.grade-benefit > div > .grade-name {
  position: relative;
  z-index: 0;
}
.shop-point-infobox2 span {
  position: relative; /* 또는 absolute, fixed 등 */
  z-index: -1; /* 모달 뒤에 놓기 위해 */
}

.grade-benefit > div:nth-of-type(1) > span {
  color: purple;
}
.grade-benefit > div:nth-of-type(1) .grade-name::before,
.grade-benefit > div:nth-of-type(2) .grade-name::before,
.grade-benefit > div:nth-of-type(3) .grade-name::before {
  content: "";
  position: absolute;
  transform: translate(-70%, -7%);
  height: 24px;
  width: 24px;
  background: url("https://static-resource-smartstore.pstatic.net/smartstore/p/static/20240912163858/img/sprite/svg/spIcon_svg.svg");
  background-position: -380px -739px;
  background-size: 853px 819px;
  z-index: -1;
}

.grade-benefit > div:nth-of-type(2) > span {
  color: red;
}
.grade-benefit > div:nth-of-type(2) .grade-name::before {
  background-size: 853px 819px;
  background-position: -412px -739px;
  width: 24px;
  height: 24px;
}

.grade-benefit > div:nth-of-type(3) > span {
  color: gold;
}
.grade-benefit > div:nth-of-type(3) .grade-name::before {
  background-size: 853px 819px;
  background-position: -4px -739px;
  width: 24px;
  height: 24px;
}

.spinner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 로딩 스피너 스타일 */
.spinner {
  border: 8px solid rgba(0, 0, 0, 0.1); /* 밝은 회색 배경 */
  border-left: 8px solid #3498db; /* 파란색 스피너 */
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
}
/* 스피너 애니메이션 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media screen and (max-width: 700px) {
  .shop-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .shop-product-img {
    position: inherit;
    display: block;
    margin-bottom: 50px;
    width: 100%;
  }
  .shop-product-options {
    width: 100%;
  }
  .shop-product-detail {
    display: inline-block;
    margin: 0 auto;
  }
}
</style>
