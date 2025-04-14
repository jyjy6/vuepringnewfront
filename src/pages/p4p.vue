<template>
  <h1 class="ranking-title">CURRENT POUND FOR POUND TOP 10</h1>
  <div
    class="ranking-list cursor-pointer"
    v-for="(player, index) in p4pTop10"
    :key="player.id"
    @click="openBoxerModal(index)"
  >
    <transition :css="false" @before-enter="beforeEnter" @enter="enter">
      <div class="ranking-card" :style="getAnimationDelay(index)">
        <div class="rank-number">#{{ player.p4pRanking }}</div>
        <div class="player-info">
          <img
            :src="player.boxer.boxerImg"
            alt="Boxer Image"
            class="boxer-image"
          />
          <div class="player-details">
            <h2 class="boxer-name">{{ player.boxer.name }}</h2>
            <p class="ranking-date">
              Ranking Date:
              {{ new Date(player.rankingDate).toLocaleDateString() }}
            </p>
            <strong v-if="!player.previousRanking" class="rank-up">NEW</strong>
            <span
              v-else
              class="changed-ranking"
              :class="{
                'rank-up': player.previousRanking - player.p4pRanking > 0,
                'rank-down': player.previousRanking - player.p4pRanking < 0,
              }"
            >
              순위변화: {{ player.previousRanking - player.p4pRanking }}위
              <span v-if="player.previousRanking - player.p4pRanking > 0"
                >상승!</span
              >
              <span v-if="player.previousRanking - player.p4pRanking < 0"
                >하락!</span
              >
            </span>
          </div>
        </div>
      </div>
    </transition>
  </div>
  <v-btn
    v-if="loginStore.getUser?.role === 'ADMIN'"
    color="primary"
    outlined
    @click="p4pModalOpen = true"
    style="display: flex; justify-self: center"
    >P4P수정</v-btn
  >
  <BoxerDetailModalComponent
    :selectedBoxer="selectedBoxer"
    :boxers="boxerDataStore.boxers"
  />
  <!-- ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ나중에 USER빼셈 ↓ -->

  <v-dialog
    v-model="p4pModalOpen"
    max-width="800"
    scrollable
    persistent
    content-class="custom-dialog"
    @click:outside="p4pModalOpen = false"
  >
    <v-card class="rounded-lg">
      <v-form @submit.prevent="addToP4PArray">
        <v-card-title class="primary white--text">
          P4P 랭킹 관리
          <v-spacer></v-spacer>
          <v-btn icon dark @click="p4pModalOpen = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <!-- 체급 선택 -->
          <select
            v-model="weightClass"
            style="background-color: white; color: black"
          >
            <option disabled value="">체급을 선택하세요</option>
            <option
              v-for="division in DivisionData"
              :key="division.id"
              :value="division.routerlink"
            >
              {{ division.divisions }}
            </option>
          </select>

          <!-- 복서 검색 및 선택 -->
          <v-text-field
            v-model="searchTerm"
            placeholder="복서 이름 검색"
            outlined
            dense
            prepend-inner-icon="mdi-magnify"
            class="mb-4"
            hide-details
          ></v-text-field>

          <v-subheader class="pl-0">복서를 선택해주세요</v-subheader>

          <v-progress-linear
            v-if="p4pStore.loading"
            indeterminate
            color="primary"
          ></v-progress-linear>

          <v-list v-else style="cursor: pointer">
            <v-list-item
              v-for="boxer in filteredBoxers"
              :key="boxer.id"
              @click="
                selectedBoxerId = boxer.id;
                selectedBoxerName = boxer.name;
              "
              :class="{ 'selected-boxer': selectedBoxerId === boxer.id }"
            >
              <div class="d-flex align-center" style="gap: 16px; width: 100%">
                <!-- 아바타 이미지 -->
                <v-avatar size="70">
                  <v-img :src="boxer.boxerImg" alt="Boxer Image"></v-img>
                </v-avatar>

                <!-- 텍스트 정보 -->
                <div>
                  <div class="d-flex align-center">
                    <v-chip
                      v-if="boxer.ranking === 1"
                      small
                      color="amber"
                      class="mr-2"
                    >
                      CHAMPION
                    </v-chip>
                    <span class="caption text-grey mr-2">
                      체급 내 {{ boxer.ranking }}위
                    </span>
                  </div>
                  <div class="font-weight-medium">{{ boxer.name }}</div>
                </div>
              </div>
            </v-list-item>
          </v-list>

          <!-- 선택한 복서 정보 입력 -->
          <v-expand-transition>
            <v-card v-if="selectedBoxerId" class="mt-4 pa-4" outlined>
              <v-card-title class="subtitle-1">
                선택한 복서: {{ selectedBoxerName }}
              </v-card-title>

              <v-text-field
                v-model="form.p4pRanking"
                label="변경할 P4P 랭킹"
                type="number"
                outlined
                dense
                required
                class="mb-4"
                hide-details
              ></v-text-field>

              <v-btn type="submit" color="primary" block depressed>
                변경 리스트에 추가
              </v-btn>
            </v-card>
          </v-expand-transition>

          <!-- 선택된 복서 목록 -->
          <v-slide-y-transition group>
            <v-chip
              v-for="(box, index) in p4pFormArray"
              :key="box.boxerId as number"
              close
              class="ma-1"
              color="secondary"
              text-color="white"
              @click:close="removeBoxer(index)"
            >
              <v-avatar left>
                <v-icon>mdi-account-box</v-icon>
              </v-avatar>
              {{ box.boxerName }} ({{ box.p4pRanking }}위)
            </v-chip>
          </v-slide-y-transition>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="justify-end pa-4">
          <v-btn
            @click="insertP4P"
            color="success"
            :disabled="p4pFormArray.length === 0"
            depressed
          >
            <v-icon left>mdi-content-save</v-icon>
            전체 저장
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
  <div style="height: 500px"></div>
</template>

<script setup lang="ts">
import axios from "axios";
import { computed, onMounted, ref, watch } from "vue";
import { useP4PStore } from "../store/p4pStore";
import BoxerDetailModalComponent from "../components/BoxerDetailModalComponent.vue";
import { useBoxerDataStore } from "../store/boxerDataStore";
import { useSecureApi } from "../composables/useSecureApi";
import DivisionData from "../assets/DivisionData";
import { useLoginStore } from "../store/loginStore";

const p4pStore = useP4PStore();
const p4pTop10 = computed(() => p4pStore.p4pData);
const loginStore = useLoginStore();

const searchTerm = ref("");

interface Boxer {
  id: number;
  name: string;
  boxerImg: string;
  title: string;
  ranking: number;
}

const form = ref({
  p4pScore: 0,
  p4pRanking: 9999,
});

const boxerDataStore = useBoxerDataStore();
const selectedBoxer = ref(0);

const openBoxerModal = async (index: number) => {
  await boxerDataStore.getOneBoxer(p4pTop10.value[index].boxer.id);
  boxerDataStore.modalOpen = true;
};

const boxers = ref<Boxer[] | null>([]);
const selectedBoxerId = ref<number | null>(null); // 선택한 복서의 ID
const selectedBoxerName = ref("");
const weightClass = ref("");

interface P4PData {
  boxerId: number | null;
  p4pRanking: number;
  p4pScore: number;
  boxerName: string;
}

const p4pFormArray = ref<P4PData[]>([]); // P4PData 타입으로 정의

// 복서 필터링 computed 속성

const filteredBoxers = computed(() => {
  if (!boxers.value) {
    return []; // boxers가 null일 경우 빈 배열 반환
  }
  if (!searchTerm.value) {
    return boxers.value; // 검색어가 없으면 전체 반환
  }
  return boxers.value.filter((boxer) =>
    boxer.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  ); // 검색어가 포함된 복서만 반환
});

// 체급이 변경되면 복서 리스트를 불러옴
watch(weightClass, () => {
  if (weightClass.value) {
    fetchboxers();
  }
});

// 복서 리스트를 서버에서 불러옴
const fetchboxers = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/boxers`,
      {
        params: {
          weightClass: weightClass.value,
        },
      }
    );
    boxers.value = response.data;
  } catch (error) {
    console.error("Error fetching boxers:", error);
  }
};

// 선택된 복서의 P4P 정보를 배열에 추가
const addToP4PArray = () => {
  const p4pData: P4PData = {
    boxerId: selectedBoxerId.value,
    p4pRanking: form.value.p4pRanking,
    p4pScore: form.value.p4pScore,
    boxerName: selectedBoxerName.value,
  };

  // 배열에 동일한 복서 ID가 이미 존재하는지 확인
  const existingIndex = p4pFormArray.value.findIndex(
    (item) => item.boxerId === selectedBoxerId.value
  );

  if (existingIndex !== -1) {
    // 존재하면 기존 데이터를 업데이트
    p4pFormArray.value[existingIndex] = p4pData;
  } else {
    // 없으면 새로 추가
    p4pFormArray.value.push(p4pData);
  }
  // 입력 필드 초기화
  form.value.p4pScore = 0;
  form.value.p4pRanking = 9999;
  selectedBoxerId.value = null; // 선택 초기화
  weightClass.value = "";
  boxers.value = null;
};

const api = useSecureApi();
// P4P 배열을 서버로 전송
const insertP4P = async () => {
  try {
    const rankingReset = await api.securePost(
      `${import.meta.env.VITE_API_BASE_URL}/api/p4p/reset`,
      {}
    );
    console.log("이전 랭킹이 성공적으로 저장되었습니다:", rankingReset.data);

    // P4P 배열 데이터를 개별적으로 서버에 전송
    for (const p4pData of p4pFormArray.value) {
      const response = await api.securePost(
        `${import.meta.env.VITE_API_BASE_URL}/api/p4p`,
        p4pData
      );
      console.log("성공적으로 전송되었습니다:", response.data);
    }

    // 모든 데이터 전송이 완료된 후 로그 저장 요청
    const logResponse = await api.securePost(
      `${import.meta.env.VITE_API_BASE_URL}/api/p4p/log`,
      {}
    );
    console.log("로그가 성공적으로 저장되었습니다:", logResponse.data);

    // 전송 후 배열 초기화
    p4pFormArray.value = [];
  } catch (error) {
    console.error("전송 중 오류 발생:", error);
  } finally {
    alert("복서 P4P데이터가 전송되었습니다!");
    fetchboxers();
    window.location.reload();
  }
};

/* 위의 로직은 for문쳐서 하는것 -> 아래의 Promise all로 개선할 수 있음.
const insertP4P = async () => {
  try {
    const rankingReset = await api.securePost('http://localhost:8080/api/p4p/reset', {}, {
      withCredentials: true,
    });
    console.log('이전 랭킹이 성공적으로 저장되었습니다:', rankingReset.data);

    // P4P 배열 데이터를 병렬적으로 서버에 전송
    const promises = p4pFormArray.value.map(p4pData =>
      api.securePost('http://localhost:8080/api/p4p', p4pData, { withCredentials: true })
    );
    const responses = await Promise.all(promises);
    responses.forEach(response => console.log('성공적으로 전송되었습니다:', response.data));

    // 로그 저장
    const logResponse = await api.securePost('http://localhost:8080/api/p4p/log', {}, {
      withCredentials: true,
    });
    console.log('로그가 성공적으로 저장되었습니다:', logResponse.data);

    // 배열 초기화
    p4pFormArray.value = [];
  } catch (error) {
    console.error('전송 중 오류 발생:', error);
  }
};
  */
const p4pModalOpen = ref(false);

onMounted(() => {
  p4pStore.fetchP4PData();
});

const beforeEnter = (el: Element) => {
  if (el instanceof HTMLElement) {
    el.style.opacity = "0";
  }
};

const enter = (el: Element, done: () => void) => {
  const delay = (el as HTMLElement).style.animationDelay || "0s";
  setTimeout(() => {
    (el as HTMLElement).style.opacity = "1";
    done();
  }, parseFloat(delay) * 1000); // Convert delay to ms
};

const getAnimationDelay = (index: number) => {
  return {
    animationDelay: `${index * 0.2}s`, // 0.2초 단위로 문자열로 변환
  };
};

// Example Data
const removeBoxer = (index: number) => {
  p4pFormArray.value.splice(index, 1);
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap");

* {
  font-family: "Noto Sans KR", sans-serif !important;
}

.ranking-title {
  font-size: 2.5rem; /* 폰트 크기 */
  font-weight: bold; /* 두껍게 */
  color: #e63946; /* 강렬한 색상 */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* 그림자 효과 */
  margin-bottom: 20px; /* 제목과 카드 사이의 여백 */
  font-family: "Arial", sans-serif; /* 글꼴 설정 */
  text-align: center;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  margin-top: 1rem;
}

.select-boxer-profile,
.boxer-profile {
  display: flex;
  align-items: center;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  width: 100%;
}

.select-boxer-image,
.boxer-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 1rem;
}
.select-boxer-image {
  width: 50px;
  height: 50px;
}

.boxer-info {
  flex: 1;
}

.boxer-name {
  margin: 0;
  font-size: 1rem;
  font-weight: bold;
  color: #333;
}

.boxer-description {
  margin: 0.5rem 0 0;
  color: #666;
  font-size: 1rem;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 800px;
  margin: 0 auto;
  margin-top: 30px;
}

.ranking-card {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.ranking-card:hover {
  transform: translateY(-5px);
}

.rank-number {
  font-size: 2rem;
  font-weight: bold;
  color: #007bff;
  margin-right: 20px;
  width: 10%;
}

.player-info {
  display: flex;
  align-items: center;
  width: 100%;
}

.boxer-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-right: 20px;
  object-fit: cover;
}

.player-details {
  display: flex;
  flex-direction: column;
}

.boxer-name {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.p4p-score,
.ranking-date {
  font-size: 0.9rem;
  color: #6c757d;
  margin: 2px 0;
}
.changed-ranking {
  font-weight: bold;

  margin-top: 10px;
}

.rank-up {
  color: red; /* 순위 상승 시 빨강 */
}

.rank-down {
  color: blue; /* 순위 하락 시 파랑 */
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.ranking-card {
  opacity: 0; /* Ensure hidden before animation starts */
  animation: fadeInUp 0.9s ease-out forwards;
}

/* 폼스타일 ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ */

.form-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

label {
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
  color: #333;
}

select,
input {
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-top: 5px;
}

.btn-primary,
.btn-success {
  display: inline-block;
  padding: 10px 20px;
  font-size: 1rem;
  color: white;
  background-color: #3498db;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
  margin: auto;
}

.btn-primary:hover,
.btn-success:hover {
  background-color: #2980b9;
}

.select-boxer-profile {
  box-sizing: border-box;
  height: 50px;
  padding: 10px;
  background-color: #f4f4f4;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s;
  width: 50%;
  margin: 0 auto;
}

.boxer-profile:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 600px;
  margin: auto;
}

/* 선택된 복서 명단 */
.selected-boxers-list {
  margin-top: 20px;
  width: 50%;
  margin: 0 auto;
}

.selected-boxer-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  margin-bottom: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.boxer-info {
  flex-grow: 1;
}

.boxer-info p {
  margin: 5px 0;
  color: #333;
}

.remove-boxer-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.remove-boxer-btn:hover {
  background-color: #c0392b;
}

.divider {
  height: 1px;
  background-color: #ddd;
  margin: 10px 0;
}

.custom-dialog {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px);
}
</style>
