<template>
  <v-container>
    <router-view></router-view>

    <v-row justify="center" class="mb-6">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold text-center primary--text">
          상품 리스트
        </h1>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col cols="12" lg="9" md="10">
        <v-row>
          <v-col
            v-for="item in paginatedItems"
            :key="item.id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-card
              :to="{ name: 'ShopDetail', params: { id: item.id } }"
              @click="scrollToTop"
              elevation="3"
              class="rounded-lg transition-swing h-100"
              hover
            >
              <v-img
                :src="item.fileURLs[0]"
                height="180"
                cover
                class="align-end"
                gradient="to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6)"
              >
                <v-chip
                  color="red-lighten-1"
                  class="ma-2 font-weight-bold"
                  size="small"
                  variant="elevated"
                >
                  {{ item.condition }}
                </v-chip>
              </v-img>

              <v-card-title class="text-truncate">{{ item.name }}</v-card-title>

              <v-card-text>
                <v-row align="center" class="mx-0 mb-2">
                  <div class="text-h6 font-weight-bold red--text">
                    {{ Intl.NumberFormat().format(item.price) }} 원
                  </div>
                </v-row>

                <div
                  class="text-caption text-medium-emphasis d-flex align-center mb-1"
                >
                  <v-icon size="small" class="mr-1">mdi-truck-delivery</v-icon>
                  {{ item.shipping }}
                </div>

                <div
                  class="text-caption text-medium-emphasis d-flex align-center mb-1"
                >
                  <v-icon size="small" class="mr-1">mdi-factory</v-icon>
                  {{ item.manufacturer }}
                </div>

                <div
                  class="text-caption text-medium-emphasis d-flex align-center mb-1"
                >
                  <v-icon size="small" class="mr-1">mdi-tag</v-icon>
                  {{ item.brand }}
                </div>

                <div
                  class="text-caption text-medium-emphasis d-flex align-center mb-1"
                >
                  <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
                  {{ item.origin }}
                </div>

                <div
                  class="text-caption text-medium-emphasis d-flex align-center"
                >
                  <v-icon size="small" class="mr-1">mdi-calendar</v-icon>
                  {{ formatDate(item.createdAt) }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row justify="center" class="mt-6">
      <v-col cols="auto">
        <v-pagination
          v-model="shopStore.currentPage"
          :length="shopStore.totalPages"
          :total-visible="7"
          rounded
          prev-icon="mdi-chevron-left"
          next-icon="mdi-chevron-right"
          @update:model-value="handlePageChange"
        ></v-pagination>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useShopStore } from "../store/shopStore";

const shopStore = useShopStore();

onMounted(() => {
  shopStore.fetchShopItemData();
});
const handlePageChange = (page: number) => {
  shopStore.setPage(page);
};

const formatDate = (dateString: string) => {
  const options: any = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("ko-KR", options);
};

// 페이지네이션
const paginatedItems = computed(() => {
  if (!shopStore.shopData || shopStore.shopData.length === 0) {
    return [];
  } else {
    return shopStore.shopData;
  }
});

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
</script>

<style scoped>
.v-card {
  transition: transform 0.3s ease-in-out;
}

.v-card:hover {
  transform: translateY(-5px);
}
</style>
