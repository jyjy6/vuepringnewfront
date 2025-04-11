<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        주문 관리
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="검색"
          single-line
          hide-details
          density="compact"
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="orders"
        :search="search"
        :loading="loading"
        :items-per-page="10"
        :items-per-page-options="[5, 10, 15, 20]"
        class="elevation-1"
        item-value="id"
      >
        <template v-slot:item.price="{ item }">
          {{ item.price.toLocaleString() }}
        </template>
        <template v-slot:item.totalPrice="{ item }">
          {{ item.totalPrice.toLocaleString() }}원
        </template>

        <template v-slot:item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>

        <template v-slot:item.deliveryStatus="{ item }">
          <v-chip
            :color="getStatusColor(item.deliveryStatus)"
            text-color="white"
            size="small"
          >
            {{ getStatusText(item.deliveryStatus) }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn color="primary" size="small" v-bind="props">
                상태 변경
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="status in deliveryStatusOptions"
                :key="status.code"
                @click="updateOrderStatus(item.id, status.code)"
              >
                <v-list-item-title>{{ status.text }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>

    <!-- 상태 업데이트 결과 스낵바 -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          icon="mdi-close"
          @click="snackbar.show = false"
        ></v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import axios from "axios";
import { useSecureApi } from "../../composables/useSecureApi";

// Types
interface Order {
  id: number;
  orderer: string;
  title: string;
  color: string;
  price: number;
  quantity: number;
  totalPrice: number;
  address: string;
  phoneNumber: string;
  createdAt: string;
  username: { username: string };
  deliveryStatus: string;
}

interface StatusOption {
  code: number;
  text: string;
}

interface Snackbar {
  show: boolean;
  text: string;
  color: string;
}

// Reactive state
const orders = ref<Order[]>([]);
const loading = ref<boolean>(true);
const search = ref<string>("");

const snackbar = reactive<Snackbar>({
  show: false,
  text: "",
  color: "success",
});

// Table headers
const headers = [
  { title: "주문번호", align: "start", key: "id" },
  { title: "수령인", key: "orderer" },
  { title: "주문자 ID", key: "username" },
  { title: "상품명", key: "title" },
  { title: "색상", key: "color" },
  { title: "가격", key: "price", sortable: true },
  { title: "수량", key: "quantity", sortable: true },
  { title: "총 가격", key: "totalPrice", sortable: true },
  { title: "배송지", key: "address" },
  { title: "전화번호", key: "phoneNumber" },
  { title: "주문일시", key: "createdAt", sortable: true },
  { title: "배송상태", key: "deliveryStatus", sortable: true },
  { title: "작업", key: "actions", sortable: false },
] as const;

// Delivery status options
const deliveryStatusOptions: StatusOption[] = [
  { code: 1, text: "주문 완료" },
  { code: 2, text: "결제 완료" },
  { code: 3, text: "배송 시작" },
  { code: 4, text: "배송 완료" },
  { code: 5, text: "반품 진행" },
  { code: 6, text: "반품 완료" },
  { code: 7, text: "구매 완료" },
];

// Get orders on component mount
onMounted(async () => {
  await fetchOrders();
});

// 페이지네이션 안돼있음 -> 다른 페이지네이션 되어있는 shop.vue chat.vue등과 비교하려고 걍 남겨둠
const fetchOrders = async (): Promise<void> => {
  try {
    loading.value = true;
    const response = await axios.get("/api/orders");
    orders.value = response.data;
  } catch (error) {
    console.error("주문 데이터를 불러오는 중 오류가 발생했습니다:", error);
    snackbar.text = "주문 데이터를 불러오는 중 오류가 발생했습니다.";
    snackbar.color = "error";
    snackbar.show = true;
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getStatusText = (status: string): string => {
  const found = deliveryStatusOptions.find((option) =>
    `ORDER_COMPLETED` === status
      ? option.code === 1
      : `PAYMENT_COMPLETED` === status
      ? option.code === 2
      : `SHIPPING_STARTED` === status
      ? option.code === 3
      : `SHIPPING_COMPLETED` === status
      ? option.code === 4
      : `RETURN_IN_PROGRESS` === status
      ? option.code === 5
      : `RETURN_COMPLETED` === status
      ? option.code === 6
      : `PURCHASE_COMPLETED` === status
      ? option.code === 7
      : false
  );
  return found ? found.text : "알 수 없음";
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case "ORDER_COMPLETED":
      return "blue";
    case "PAYMENT_COMPLETED":
      return "indigo";
    case "SHIPPING_STARTED":
      return "purple";
    case "SHIPPING_COMPLETED":
      return "teal";
    case "RETURN_IN_PROGRESS":
      return "orange";
    case "RETURN_COMPLETED":
      return "red";
    case "PURCHASE_COMPLETED":
      return "green";
    default:
      return "grey";
  }
};

const api = useSecureApi();
const updateOrderStatus = async (
  orderId: number,
  statusCode: number
): Promise<void> => {
  try {
    await api.securePost(
      `/api/orders/${orderId}/update-status?status=${statusCode}`,
      {}
    );

    // 성공 시 주문 목록을 다시 불러옴
    await fetchOrders();

    snackbar.text = "주문 상태가 성공적으로 업데이트되었습니다.";
    snackbar.color = "success";
    snackbar.show = true;
  } catch (error) {
    console.error("주문 상태 업데이트 중 오류가 발생했습니다:", error);
    snackbar.text = "주문 상태 업데이트에 실패했습니다.";
    snackbar.color = "error";
    snackbar.show = true;
  }
};
</script>
