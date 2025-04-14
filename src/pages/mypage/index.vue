<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import { useLoginStore } from "../../store/loginStore";
import { useSecureApi } from "../../composables/useSecureApi";
import { useRouter } from "vue-router";
import { nextTick } from "vue";

interface SalesAllDTO {
  id: number;
  name: string;
  fileURLs: string[];
}

const likedProducts = ref<SalesAllDTO[]>([]);
const likedMap = ref<Record<number, boolean>>({}); // <- 각 상품의 좋아요 상태
const loginStore = useLoginStore();
const userId = loginStore.getUser?.id;
const router = useRouter();

const defaultImage = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"; // 기본 프로필 이미지

const formattedDate = (date?: string) => {
  if (!date) return "정보 없음";
  return new Date(date).toLocaleDateString();
};

const api = useSecureApi();

onMounted(async () => {
  const res = await axios.get(`/api/likes/member/${userId}`);
  likedProducts.value = res.data;

  // 좋아요 된 상품 ID들을 가져와서 likedMap에 true로 설정
  res.data.forEach((item: SalesAllDTO) => {
    likedMap.value[item.id] = true;
  });
});

const toggleLike = async (productId: number) => {
  try {
    await api.securePost(`${import.meta.env.VITE_API_BASE_URL}/api/likes`, {
      memberId: loginStore.getUser?.id,
      salesId: productId,
    });

    // 토글
    likedMap.value[productId] = !likedMap.value[productId];
  } catch (err) {
    console.error(err);
    alert("에러 발생");
  }
};

const goToModify = async () => {
  await router.push("/mypage/modify");
  await nextTick(); // DOM 렌더링 완료 대기

  // <router-view>가 있는 곳으로 스크롤 이동
  const target = document.getElementById("router-view-anchor");
  if (target) {
    target.scrollIntoView({ behavior: "smooth" });
  }
};
</script>

<template>
  <h3 class="text-center mb-6">마이페이지</h3>
  <v-container class="py-10">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="pa-6 rounded-xl elevation-4">
          <v-row align="center" class="mb-4">
            <v-col cols="12" class="text-center">
              <v-avatar size="100">
                <v-img
                  :src="loginStore.getUser?.profileImage || defaultImage"
                  alt="Profile"
                />
              </v-avatar>
              <h2 class="mt-3">
                {{ loginStore.getUser?.displayName || "사용자 이름 없음" }}
              </h2>
              <div class="text-subtitle-1 grey--text">
                {{ loginStore.getUser?.email }}
              </div>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <v-list dense>
            <v-list-item>
              <v-list-item-title>아이디</v-list-item-title>
              <v-list-item-subtitle>{{
                loginStore.getUser?.username
              }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item v-if="loginStore.getUser?.phone">
              <v-list-item-title>전화번호</v-list-item-title>
              <v-list-item-subtitle>{{
                loginStore.getUser.phone
              }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item v-if="loginStore.getUser?.country">
              <v-list-item-title>국가</v-list-item-title>
              <v-list-item-subtitle>{{
                loginStore.getUser.country
              }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item v-if="loginStore.getUser?.mainAddress">
              <v-list-item-title>주소</v-list-item-title>
              <v-list-item-subtitle
                >{{ loginStore.getUser.mainAddress }}
                {{ loginStore.getUser.subAddress }}</v-list-item-subtitle
              >
            </v-list-item>

            <v-list-item>
              <v-list-item-title>가입일</v-list-item-title>
              <v-list-item-subtitle>{{
                formattedDate(loginStore.getUser?.createdAt)
              }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>권한</v-list-item-title>
              <v-list-item-subtitle>{{
                loginStore.getUser?.role
              }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <v-btn
            @click="
              router.push('/mypage/modify');
              goToModify();
            "
            size="small"
            variant="plain"
            color:primary
            class="mr-0"
            >정보수정</v-btn
          >
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <v-container>
    <h3 class="text-center mb-10">찜한 상품 목록</h3>
    <v-row style="border: 1px black solid; margin-bottom: 10px">
      <v-col
        v-for="product in likedProducts"
        :key="product.id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card class="mx-auto position-relative" max-width="344" elevation="2">
          <v-img :src="product.fileURLs[0]" height="200px"></v-img>
          <v-card-title>{{ product.name }}</v-card-title>
          <v-card-actions>
            <v-btn color="primary" :to="`/shop/detail/${product.id}`"
              >상품 보기</v-btn
            >
          </v-card-actions>
          <v-btn
            icon
            color="error"
            variant="text"
            size="large"
            @click="toggleLike(product.id)"
            class="position-absolute"
            style="right: 0; top: 0"
          >
            <v-icon>{{
              likedMap[product.id] ? "mdi-heart" : "mdi-heart-outline"
            }}</v-icon>
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <div id="router-view-anchor">
    <router-view />
  </div>
</template>

<style scoped>
h3 {
  font-weight: bold;
}
</style>
