<template>
  <v-app style="margin-bottom: 100px">
    <v-main>
      <v-container v-if="currentItem" class="product-container">
        <v-row class="product-detail-section">
          <!-- Product Image Section -->
          <v-col cols="12" md="6" class="product-images">
            <v-card elevation="0" class="main-image-card">
              <v-img
                :src="currentItem.fileURLs[mouseoverdImage]"
                cover
                class="rounded-lg main-product-image"
                @click="openModal(currentItem.fileURLs[mouseoverdImage])"
              ></v-img>
            </v-card>

            <v-row class="mt-4 preview-images">
              <v-col
                v-for="(fileURL, index) in currentItem.fileURLs"
                :key="index"
                cols="3"
              >
                <v-card
                  elevation="1"
                  class="preview-card"
                  :class="{ 'active-preview': mouseoverdImage === index }"
                  @click="openModal(fileURL)"
                  @mouseover="mouseoverdImage = index"
                >
                  <v-img
                    :src="fileURL"
                    height="80"
                    cover
                    class="rounded-lg"
                  ></v-img>
                </v-card>
              </v-col>
            </v-row>
          </v-col>

          <!-- Product Details Section -->
          <v-col cols="12" md="6" class="product-info">
            <div class="product-header">
              <h1 class="text-h4 font-weight-bold mb-1">
                {{ currentItem.name }}
              </h1>
              <div class="d-flex align-center">
                <v-chip
                  color="primary"
                  size="small"
                  class="mr-2"
                  v-if="currentItem.condition === 'New'"
                  >신상품</v-chip
                >
                <v-chip
                  color="secondary"
                  size="small"
                  v-if="currentItem.brand"
                  >{{ currentItem.brand }}</v-chip
                >
              </div>
            </div>

            <v-divider class="my-4"></v-divider>

            <div class="price-section">
              <div class="d-flex justify-space-between align-center">
                <div>
                  <h2 class="text-h4 font-weight-bold primary-text">
                    {{ Intl.NumberFormat().format(currentItem.price) }}원
                  </h2>
                  <div class="shipping-text">
                    {{
                      currentItem.shippingInfo[0].freeShipping
                        ? "무료배송"
                        : "배송비 2,500원"
                    }}
                  </div>
                </div>
                <v-btn icon color="error" variant="text" size="large">
                  <v-icon>mdi-heart-outline</v-icon>
                </v-btn>
              </div>
            </div>

            <v-card class="mt-4 benefits-card" variant="outlined">
              <v-card-title class="benefits-title">
                <v-icon color="primary" class="mr-2">mdi-diamond-stone</v-icon>
                복싱천재 고객을 위한 혜택
              </v-card-title>
              <v-card-text>
                <div class="benefit-item">
                  <span>최대 적립 포인트</span>
                  <span class="text-primary font-weight-medium">21,630원</span>
                </div>
                <div class="benefit-item">
                  <span>기본적립</span>
                  <span
                    >{{
                      Intl.NumberFormat().format(currentItem.price * 0.01)
                    }}원</span
                  >
                </div>
                <div class="benefit-item">
                  <span>네이버페이 머니 결제 시 적립</span>
                  <span
                    >{{
                      Intl.NumberFormat().format(currentItem.price * 0.02)
                    }}원</span
                  >
                </div>

                <v-divider class="my-3"></v-divider>

                <div class="promo-box">
                  <v-icon color="success" class="mr-2">mdi-tag-multiple</v-icon>
                  <span class="font-weight-bold">복수구매할인</span>
                  <span class="ml-2">2개 이상 구매시 10,000원 추가할인</span>
                </div>
              </v-card-text>
            </v-card>

            <v-card class="mt-4" v-if="isDuringDay" variant="outlined">
              <v-card-text class="d-flex align-center">
                <v-icon color="amber-darken-2" size="large" class="mr-3"
                  >mdi-clock-fast</v-icon
                >
                <div>
                  <div class="text-h6">오늘출발 상품</div>
                  <div class="text-body-2">
                    {{ timeLeft }} 내에 결제시 오늘 바로 발송됩니다.
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <v-card class="mt-4 shipping-card" variant="outlined">
              <v-card-text>
                <div class="d-flex">
                  <v-icon color="blue-grey" class="mr-2"
                    >mdi-truck-delivery</v-icon
                  >
                  <div>
                    <div>
                      {{ currentItem.shippingInfo[0].type }} |
                      {{
                        currentItem.shippingInfo[0].freeShipping
                          ? "무료배송"
                          : "배송비 2,500원"
                      }}, 우체국택배
                    </div>
                    <div class="text-caption text-grey">
                      제주/도서산간
                      {{
                        Intl.NumberFormat().format(
                          currentItem.shippingInfo[0].islandAdditionalFee
                        )
                      }}원
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <!-- Options Selection -->
            <v-card class="mt-4 options-card" variant="outlined">
              <v-card-title>옵션 선택</v-card-title>
              <v-card-text>
                <v-select
                  v-model="selectedSize"
                  :items="uniqueSizes"
                  label="사이즈 선택"
                  variant="outlined"
                  density="comfortable"
                  class="mb-2"
                ></v-select>

                <v-select
                  v-if="filteredColors.length > 0"
                  v-model="selectedColor"
                  :items="filteredColors"
                  label="색상 선택"
                  variant="outlined"
                  density="comfortable"
                  @update:model-value="updateQuantity"
                ></v-select>
              </v-card-text>
            </v-card>

            <!-- Selected Options -->
            <v-card
              v-if="sendingForm.length > 0"
              class="mt-4 selected-options-card"
              variant="outlined"
            >
              <v-card-title>
                <v-icon color="primary" class="mr-2">mdi-cart-outline</v-icon>
                선택한 옵션
              </v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item
                    v-for="(item, index) in sendingForm"
                    :key="index"
                    class="option-list-item mb-2"
                  >
                    <v-card variant="outlined" width="100%">
                      <v-card-text>
                        <div
                          class="d-flex justify-space-between align-center mb-2"
                        >
                          <div>
                            <div class="font-weight-medium">
                              {{ item.size }} / {{ item.color }}
                            </div>
                          </div>
                          <v-btn
                            icon="mdi-close"
                            size="small"
                            color="error"
                            variant="text"
                            @click="removeOption(index)"
                          ></v-btn>
                        </div>
                        <div class="d-flex justify-space-between align-center">
                          <div class="d-flex align-center">
                            <v-btn
                              icon="mdi-minus"
                              size="x-small"
                              color="primary"
                              variant="text"
                              @click="decrementQuantity(item)"
                              :disabled="item.quantity <= 1"
                            ></v-btn>
                            <span class="mx-3">{{ item.quantity }}</span>
                            <v-btn
                              icon="mdi-plus"
                              size="x-small"
                              color="primary"
                              variant="text"
                              @click="incrementQuantity(item)"
                            ></v-btn>
                          </div>
                          <div class="text-subtitle-1 font-weight-bold">
                            {{
                              Intl.NumberFormat().format(
                                item.price * item.quantity
                              )
                            }}원
                          </div>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>

            <!-- Total Price -->
            <v-card class="mt-4 total-price-card" variant="outlined">
              <v-card-text>
                <div class="d-flex justify-space-between align-center">
                  <span class="text-h6">총 상품 금액</span>
                  <span class="text-h5 font-weight-bold primary-text">
                    {{ Intl.NumberFormat().format(totalPrice) }}원
                  </span>
                </div>
              </v-card-text>
            </v-card>

            <!-- Action Buttons -->
            <div class="action-buttons mt-6">
              <v-row>
                <v-col cols="6">
                  <v-btn
                    color="primary"
                    size="large"
                    block
                    variant="flat"
                    prepend-icon="mdi-gift"
                    >선물하기</v-btn
                  >
                </v-col>
                <v-col cols="6">
                  <v-btn
                    color="success"
                    size="large"
                    block
                    variant="flat"
                    prepend-icon="mdi-credit-card"
                    @click="
                      directBuy = true;
                      saveSendingForm();
                    "
                    >구매하기</v-btn
                  >
                </v-col>
              </v-row>
              <v-row class="mt-2">
                <v-col cols="4">
                  <v-btn
                    color="grey-lighten-3"
                    variant="flat"
                    block
                    prepend-icon="mdi-message-text"
                    >문의</v-btn
                  >
                </v-col>
                <v-col cols="4">
                  <v-btn
                    color="grey-lighten-3"
                    variant="flat"
                    block
                    prepend-icon="mdi-heart"
                    >찜하기</v-btn
                  >
                </v-col>
                <v-col cols="4">
                  <v-btn
                    color="grey-lighten-3"
                    variant="flat"
                    block
                    prepend-icon="mdi-cart"
                    @click="saveSendingForm"
                    >장바구니</v-btn
                  >
                </v-col>
              </v-row>
            </div>
          </v-col>
        </v-row>

        <!-- Product Information Tables -->
        <v-row class="mt-12">
          <v-col cols="12">
            <v-card variant="outlined">
              <v-table>
                <tbody>
                  <tr>
                    <th width="15%">상품번호</th>
                    <td width="35%">{{ currentItem.id }}</td>
                    <th width="15%">상품상태</th>
                    <td width="35%">{{ currentItem.condition }}</td>
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
                      구매만 해도 네이버페이 포인트 지급! 리뷰 작성 네이버페이
                      포인트 지급!
                    </td>
                  </tr>
                  <tr>
                    <th>원산지</th>
                    <td colspan="3">{{ currentItem.origin }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-4">
          <v-col cols="12">
            <v-card variant="outlined">
              <v-table>
                <tbody>
                  <tr>
                    <th width="15%">종류</th>
                    <td width="35%">백글러브</td>
                    <th width="15%">소재</th>
                    <td width="35%">인조가죽</td>
                  </tr>
                  <tr>
                    <th>색상</th>
                    <td>옵션 선택 참조</td>
                    <th>부가기능</th>
                    <td>옵션 선택 참조</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-4">
          <v-col cols="12">
            <v-card variant="outlined">
              <v-table>
                <tbody>
                  <tr>
                    <th width="15%">영수증발급</th>
                    <td>신용카드전표, 현금영수증발급</td>
                  </tr>
                  <tr>
                    <th>A/S 안내</th>
                    <td>
                      <v-btn variant="text" density="compact" color="primary"
                        >상세정보확인</v-btn
                      >
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>
          </v-col>
        </v-row>

        <!-- Membership Grades -->
        <v-row class="mt-8 mb-16">
          <v-col cols="12">
            <div class="text-h6 mb-4">회원 등급별 혜택</div>
            <v-row>
              <v-col
                v-for="(dc, i) in currentItem.discounts"
                :key="i"
                cols="12"
                md="4"
              >
                <v-card
                  variant="outlined"
                  class="membership-card"
                  :class="`membership-${i + 1}`"
                >
                  <v-card-text class="text-center py-8">
                    <v-avatar
                      :color="getMembershipColor(i)"
                      size="48"
                      class="mb-3"
                    >
                      <v-icon color="white" size="large">{{
                        getMembershipIcon(i)
                      }}</v-icon>
                    </v-avatar>
                    <div class="text-h6 font-weight-bold mb-2">
                      {{ dc.grade }}
                    </div>
                    <div class="text-h5 membership-discount">
                      {{ dc.discountRate }}% 할인
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>

      <!-- Loading Spinner -->
      <div
        v-else
        class="text-center d-flex align-center justify-center"
        style="height: 60vh"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
      </div>

      <!-- Image Modal -->
      <v-dialog
        v-model="isModalOpen"
        max-width="90vw"
        fullscreen
        @click="isModalOpen = false"
      >
        <v-card class="image-modal">
          <v-toolbar color="primary" flat>
            <v-toolbar-title class="text-white">상품 이미지</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="closeModal">
              <v-icon color="white">mdi-close</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-text class="d-flex align-center justify-center modal-content">
            <v-img
              :src="selectedImage"
              max-height="90vh"
              contain
              class="modal-image"
            ></v-img>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-main>
    <v-btn @click="test">누름</v-btn>
  </v-app>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useShopStore } from "../store/shopStore";
import { ProductRequest, ShopOption } from "../types/ShopTypes";
import { ComputedRef } from "vue";
import { useLoginStore } from "../store/loginStore";
import { useSecureApi } from "../composables/useSecureApi";
import axios from "axios";
import { nextTick } from "vue";
import { StoreCart } from "../types/ShopTypes";
import { watch } from "vue";

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
// ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ남은시간계산로직끝ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

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
const selectedSize = ref("");
const selectedColor = ref("");
const uniqueSizes = computed<string[]>(() => {
  if (!currentItem.value) return []; // currentItem이 null일 경우 빈 배열 반환
  // Set을 사용하여 중복된 사이즈 제거
  const sizes = currentItem.value.options.map((opt: ShopOption) => opt.size);
  return Array.from(new Set(sizes)); // Set을 배열로 변환하여 반환
});

// 사이즈별로 표시할 색상 옵션들
const filteredColors = computed<string[]>(() => {
  if (!currentItem.value || !selectedSize.value) return []; // currentItem이 null일 경우 빈 배열 반환

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

const test = () => {
  console.log("센딩폼");
  console.log(sendingForm.value);
};

const directBuy = ref(false);

onMounted(() => {
  window.addEventListener("keydown", handleKeydown); // 키보드 이벤트 리스너 등록
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown); // 컴포넌트가 사라질 때 리스너 해제
});

// 회원등급 아이콘 및 색상
const getMembershipIcon = (index: number) => {
  const icons = ["mdi-crown", "mdi-star", "mdi-medal"];
  return icons[index] || "mdi-account";
};

const getMembershipColor = (index: number) => {
  const colors = ["purple-darken-2", "red-darken-2", "amber-darken-2"];
  return colors[index] || "grey";
};

// 장바구니 관련ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
const quantity = ref(0);
const totalPrice = computed(() => {
  let total = 0;
  for (let index = 0; index < sendingForm.value.length; index++) {
    total += sendingForm.value[index].quantity * sendingForm.value[index].price;
  }
  return total;
});

const sendingForm = ref<any>([]);

const loginStore = useLoginStore();

const updateQuantity = () => {
  if (!selectedSize.value || !selectedColor.value) return;

  // form 객체 생성
  const form: StoreCart = {
    size: selectedSize.value,
    color: selectedColor.value,
    price: currentItem.value.price,
    quantity: 1,
    username: loginStore.user?.username as string,
    totalPrice: 0,
    img: currentItem.value.fileURLs[0],
    title: currentItem.value.name,
  };

  // 같은 옵션이 있는지 확인
  for (let index = 0; index < sendingForm.value.length; index++) {
    if (
      // sendingForm안에 사이즈와 컬러가 같은 물품이있으면 quantity만++ 하고 총 가격도++
      sendingForm.value[index].size === form.size &&
      sendingForm.value[index].color === form.color
    ) {
      sendingForm.value[index].quantity++;
      sendingForm.value[index].totalPrice =
        sendingForm.value[index].price * sendingForm.value[index].quantity;
      selectedSize.value = "";
      selectedColor.value = "";
      return;
    }
  }

  // 새 옵션 추가
  form.totalPrice = form.price * form.quantity;
  sendingForm.value.push(form);
  console.log("푸쉬된 센딩폼", sendingForm.value);
  // 선택된 사이즈와 색상을 초기화
  selectedSize.value = "";
  selectedColor.value = "";
};

const removeOption = (index: number) => {
  sendingForm.value.splice(index, 1); // 해당 인덱스의 옵션 제거
};

function incrementQuantity(item: StoreCart) {
  item.quantity += 1; // item의 수량을 증가
  item.totalPrice = item.price * item.quantity; // totalPrice 재계산
}

function decrementQuantity(item: StoreCart) {
  if (item.quantity > 1) {
    item.quantity -= 1; // item의 수량을 감소
    item.totalPrice = item.price * item.quantity; // totalPrice 재계산
  }
}

const api = useSecureApi();

const saveSendingForm = async () => {
  if (sendingForm.value.length <= 0) {
    if (confirm("뭐 옵션선택 안하셨는데 장바구니 가실래요?")) {
      return router.push("/cart");
    } else {
      directBuy.value = false;
      return;
    }
  }
  // 기존의 장바구니 데이터를 가져옵니다.
  const existingCartDataString = localStorage.getItem("sendingForm");
  // 기존 데이터가 null인 경우 빈 배열로 초기화
  const existingCartData: StoreCart[] = existingCartDataString
    ? JSON.parse(existingCartDataString)
    : [];

  // sendingForm.value 요소의 타입을 지정하여 itemsToRemove를 초기화
  const itemsToRemove: (typeof sendingForm.value)[number][] = [];

  for (let i = 0; i < existingCartData.length; i++) {
    for (let j = 0; j < sendingForm.value.length; j++) {
      if (
        // 현재 로컬스토리지에 있는 데이터의 사이즈+컬러가 새로 추가할 데이터와 같으면 수량만 증가
        existingCartData[i].size === sendingForm.value[j].size &&
        existingCartData[i].color === sendingForm.value[j].color
      ) {
        // 수량 증가
        existingCartData[i].quantity += sendingForm.value[j].quantity;
        existingCartData[i].totalPrice =
          existingCartData[i].quantity * existingCartData[i].price;

        // 수량 증가한 데이터는 걸러내서 itemsToRemove에 추가(아래에 필터용으로쓸꺼)
        itemsToRemove.push(sendingForm.value[j]);
      }
    }
  }

  // itemsToRemove에 포함되지 않은 요소들만 sendingForm.value에 남기기
  // itemsToRemove에 있는 항목들은 이미 수량 증가시킨거라 추가할필요 X)
  sendingForm.value = sendingForm.value.filter(
    (item: StoreCart) => !itemsToRemove.includes(item)
  );

  // 새로운 상품을 추가하기 전에 기존 데이터와 병합
  console.log("병합전데이터", sendingForm.value);
  existingCartData.push(...sendingForm.value);
  console.log("병합후데이터", existingCartData);

  // 로컬스토리지에 업데이트된 장바구니 데이터를 저장합니다.
  localStorage.setItem("sendingForm", JSON.stringify(existingCartData));

  // 스토어에도 업데이트
  shopStore.cartContent = existingCartData;

  if (loginStore.user) {
    try {
      const response = await api.securePost(
        `${import.meta.env.VITE_API_BASE_URL}/api/cart/insert`,
        existingCartData
      );
      if (directBuy.value) {
        sendingForm.value = [];
        return router.push("/order");
      }

      alert("장바구니에 물품이 담겼습니다!");
      console.log("성공적으로 전송되었습니다:", response.data);
    } catch (error) {
      console.error("카트 넣는 중 오류 발생:", error);
    }
  }

  if (confirm("장바구니로 이동하시겠습니까?")) {
    router.push("/cart");
  }
  sendingForm.value = [];
};
</script>

<style>
/* Custom Font Import */
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap");

/* Global Styles */
:root {
  --primary-color: #3d5afe;
  --secondary-color: #00b0ff;
  --success-color: #4caf50;
  --error-color: #f44336;
  --grey-light: #f5f5f5;
  --grey-dark: #757575;
  --text-primary: #212121;
  --text-secondary: #616161;
  --border-radius: 8px;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Base Styles */
body {
  font-family: "Noto Sans KR", sans-serif;
  color: var(--text-primary);
  line-height: 1.6;
  background-color: #fafafa;
}

/* Product Container Styles */
.product-container {
  margin-top: 24px;
  max-width: 1280px;
}

/* Product Header */
.product-header {
  margin-bottom: 16px;
}

.product-header h1 {
  line-height: 1.2;
  margin-bottom: 8px;
  font-weight: 700;
}

/* Product Images */
.product-images {
  position: sticky;
  top: 24px;
  height: fit-content;
}

.main-image-card {
  border-radius: var(--border-radius);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.main-image-card:hover {
  box-shadow: var(--shadow-md);
}

.main-product-image {
  transition: transform 0.3s ease;
}

.main-product-image:hover {
  transform: scale(1.02);
}

.preview-images {
  margin-top: 16px;
}

.preview-card {
  border-radius: var(--border-radius);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preview-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.active-preview {
  border: 2px solid var(--primary-color);
  transform: translateY(-2px);
}

/* Price Section */
.price-section {
  margin: 24px 0;
}

.primary-text {
  color: var(--primary-color);
}

.shipping-text {
  color: var(--text-secondary);
  font-size: 14px;
  margin-top: 4px;
}

/* Cards */
.benefits-card,
.shipping-card,
.options-card,
.selected-options-card,
.total-price-card {
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: all 0.2s ease;
}

.benefits-card:hover,
.shipping-card:hover,
.options-card:hover,
.selected-options-card:hover,
.total-price-card:hover {
  box-shadow: var(--shadow-sm);
}

.benefits-title {
  font-size: 16px;
  font-weight: 500;
  padding: 12px 16px;
  background-color: rgba(61, 90, 254, 0.05);
}

.benefit-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.promo-box {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f1f8e9;
  border-radius: var(--border-radius);
  font-size: 14px;
}

/* Option Selection */
.option-list-item {
  padding: 0;
  margin-bottom: 8px;
}

/* Action Buttons */
.action-buttons .v-btn {
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
  border-radius: var(--border-radius);
}

/* Modal */
.image-modal {
  background-color: rgba(0, 0, 0, 0.9);
}

.modal-content {
  height: calc(100vh - 64px);
  padding: 0;
}

.modal-image {
  max-width: 90vw;
}

/* Product Tables */
.v-table {
  border-radius: var(--border-radius);
  overflow: hidden;
}

.v-table th {
  background-color: var(--grey-light);
  font-weight: 500;
  color: var(--text-secondary);
}

/* Membership Cards */
.membership-card {
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: all 0.3s ease;
}

.membership-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.membership-1:hover {
  border-color: #ff9800;
}

.membership-2:hover {
  border-color: #9e9e9e;
}

.membership-3:hover {
  border-color: #ffc107;
}

.membership-discount {
  font-weight: 700;
  margin-top: 8px;
}

/* Responsive Adjustments */
@media (max-width: 960px) {
  .product-container {
    padding: 0 16px;
  }

  .product-detail-section {
    flex-direction: column;
  }

  .main-image-card {
    height: auto;
  }

  .product-info {
    padding-top: 24px;
  }
}

/* Animations */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.v-btn.v-btn--variant-flat.v-btn--color-success:hover {
  animation: pulse 1s infinite;
}
</style>
