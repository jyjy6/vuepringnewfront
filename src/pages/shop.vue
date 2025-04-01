<template>
  <div class="product-list">
    <router-view></router-view>
    <h1>상품 리스트</h1>
    <div class="product-grid">
      <router-link
        v-for="item in paginatedItems"
        :key="item.id"
        :to="{ name: 'ShopDetail', params: { id: item.id } }"
        class="product-card"
        @click="scrollToTop"
      >
        <img :src="item.fileURLs[0]" alt="상품 이미지" class="product-image" />
        <h2 class="product-name">{{ item.name }}</h2>
        <p class="product-price">{{ item.price }} 원</p>
        <p class="product-shipping">배송 정보: {{ item.shipping }}</p>
        <p class="product-manufacturer">제조사: {{ item.manufacturer }}</p>
        <p class="product-brand">브랜드: {{ item.brand }}</p>
        <p class="product-condition">상태: {{ item.condition }}</p>
        <p class="product-origin">원산지: {{ item.origin }}</p>
        <p class="product-date">등록일: {{ formatDate(item.createdAt) }}</p>
      </router-link>
    </div>

    <div class="pagination">
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="pagination-button"
      >
        이전
      </button>

      <span v-for="page in totalPages" :key="page" class="page-number">
        <button
          @click="goToPage(page)"
          :class="{ active: currentPage === page }"
          class="page-button"
        >
          {{ page }}
        </button>
      </span>

      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="pagination-button"
      >
        다음
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useShopStore } from "../store/shopStore";

const shopStore = useShopStore();

const itemList = computed(() => shopStore.shopData);
onMounted(() => {
  shopStore.fetchShopItemData();
});

const formatDate = (dateString: string) => {
  const options: any = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("ko-KR", options);
};

// 페이지네이션
const currentPage = ref(1);
const itemsPerPage = 8;

const paginatedItems = computed(() => {
  if (!itemList.value || itemList.value.length === 0) {
    return [];
  }
  const start = (currentPage.value - 1) * itemsPerPage;
  return itemList.value.slice(start, start + itemsPerPage);
});

const totalPages = computed(() => {
  if (!itemList.value || !Array.isArray(itemList.value)) {
    return 0; // itemList가 비어있거나 undefined이면 페이지 수는 0으로 반환
  }
  return Math.ceil(itemList.value.length / itemsPerPage);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const goToPage = (page: number) => {
  currentPage.value = page;
};
function scrollToTop() {
  window.scrollTo(0, 0); // 페이지 상단으로 스크롤
}
</script>

<style scoped>
.product-list {
  padding: 20px;
  font-family: "Arial", sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.product-grid {
  display: grid;
  width: 70%;
  grid-template-columns: repeat(auto-fill, minmax(22%, 1fr));
  gap: 20px;
  margin: 0 auto;
}

.product-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  background-color: #ffffff;
  transition: box-shadow 0.3s, transform 0.2s;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.product-card:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.product-image {
  max-width: 100%;
  border-radius: 4px;
}

.product-name {
  font-size: 1.2em;
  margin: 10px 0;
  font-weight: 600;
  color: #444;
}

.product-price {
  color: #f44336;
  font-weight: bold;
  font-size: 1.1em;
}

.product-shipping,
.product-manufacturer,
.product-brand,
.product-condition,
.product-origin,
.product-date {
  font-size: 0.9em;
  color: #777;
  margin: 5px 0;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
}

.pagination-button,
.page-button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  margin: 0 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pagination-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.page-button.active {
  background-color: #0056b3;
}

.pagination-button:hover,
.page-button:hover {
  background-color: #0056b3;
}

.page-number {
  margin: 0 5px;
}

@media screen and (max-width: 1510px) {
  .product-grid {
    display: grid;
    width: 90%;
    grid-template-columns: repeat(auto-fill, minmax(30%, 1fr));
  }
}

@media screen and (max-width: 850px) {
  .product-grid {
    display: grid;
    width: 90%;
    grid-template-columns: repeat(auto-fill, minmax(45%, 1fr));
  }
}
@media screen and (max-width: 650px) {
  .product-grid {
    display: grid;
    width: 90%;
    grid-template-columns: repeat(auto-fill, minmax(60%, 1fr));
  }
}
</style>
