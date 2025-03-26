<template>
  <h1 class="ranking-title">CURRENT POUND FOR POUND TOP 10</h1>
  <div
    class="ranking-list"
    v-for="(player, index) in p4pTop10"
    :key="player.id"
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
            <span
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

  <!-- ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ나중에 USER빼셈 ↓ -->
  <form @submit.prevent="addToP4PArray">
    <!-- 체급 선택 -->
    <select v-model="weightClass">
      <option disabled value="">체급을 선택하세요</option>
      <option
        v-for="division in DivisionData"
        :key="division.id"
        :value="division.routerlink"
      >
        {{ division.divisions }}
      </option>
    </select>

    <!-- 복서 선택 -->

    <div>
      <div class="search-input-box" v-if="boxers != null && boxers.length > 0">
        <input
          type="text"
          v-model="searchTerm"
          placeholder="복서 이름으로 검색"
          class="search-input"
          id="search-input"
        />
        <label for="search-input" class="search-label"
          ><font-awesome-icon icon="search"
        /></label>
      </div>
      <div v-if="p4pStore.loading">Loading...</div>
      <div v-else class="boxer-list">
        <div
          v-for="boxer in filteredBoxers"
          :key="boxer.id"
          class="boxer-profile select-boxer-profile"
          @click="
            selectedBoxerId = boxer.id;
            selectedBoxerName = boxer.name;
          "
        >
          <img
            :src="boxer.boxerImg"
            alt="boxer Image"
            class="select-boxer-image"
          />
          <div class="boxer-info">
            <h3 class="boxer-name">
              <span
                v-if="boxer.ranking === 1"
                style="color: gold; font-size: 1.5rem"
              >
                챔피언
              </span>
              <span v-else>{{ boxer.ranking + "위 " }}</span>
              {{ boxer.name }}
            </h3>
          </div>
        </div>
      </div>
    </div>

    <!-- 선택한 복서의 P4P 정보 입력 폼 -->
    <div v-if="selectedBoxerId" class="select-form">
      <h4>선택한 복서 ID: {{ selectedBoxerId }}</h4>
      <div class="form-group">
        <label for="p4pRanking">P4P Ranking</label>
        <input
          type="number"
          id="p4pRanking"
          v-model="form.p4pRanking"
          class="form-control"
          required
        />
      </div>
      <div class="form-group" style="display: none">
        <label for="p4pScore">P4P Score</label>
        <input
          type="number"
          id="p4pScore"
          v-model="form.p4pScore"
          class="form-control"
          required
        />
      </div>
      <button type="submit" class="btn btn-primary">Add to P4P List</button>
    </div>

    <div class="selected-boxers-list">
      <div
        v-for="(box, index) in p4pFormArray"
        :key="box.boxerId"
        class="selected-boxer-card"
      >
        <div class="boxer-info">
          <!-- <p><strong>복서 아이디:</strong> {{ box.boxerId }}</p> -->
          <p style="font-size: 1.5rem">
            변경 P4P 랭킹:<strong> {{ box.p4pRanking }}위</strong>
          </p>
          <p><strong>복서 이름:</strong> {{ box.boxerName }}</p>
        </div>
        <button class="remove-boxer-btn" @click="removeBoxer(index)">
          삭제
        </button>
      </div>
    </div>
  </form>
  <!-- P4P 배열 전송 버튼 -->
  <button
    @click="insertP4P"
    class="btn btn-success submit-button"
    v-if="p4pFormArray.length > 0"
  >
    Submit All P4P Rankings
  </button>

  <div style="height: 500px"></div>
</template>

<script setup lang="ts">
import axios from "axios";
import { computed, onMounted, ref, watch } from "vue";
import { useP4PStore } from "../store/p4pStore";
import DivisionData from "../assets/DivisionData";

const p4pStore = useP4PStore();
const p4pTop10 = computed(() => p4pStore.p4pData);

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

const boxers = ref<Boxer[] | null>([]);
const selectedBoxerId = ref<null | number>(0); // 선택한 복서의 ID
const selectedBoxerName = ref("");
const weightClass = ref("");
const p4pFormArray = ref<any>([]); // 전송할 P4P 정보를 저장할 배열
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
interface p4pData {
  boxerName: string;
  boxerId: number | null;
  p4pScore: number;
  p4pRanking: number;
}
const addToP4PArray = () => {
  const p4pData: p4pData = {
    boxerName: selectedBoxerName.value,
    boxerId: selectedBoxerId.value,
    p4pScore: form.value.p4pScore,
    p4pRanking: form.value.p4pRanking,
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

// P4P 배열을 서버로 전송
const insertP4P = async () => {
  try {
    const rankingReset = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/p4p/reset`,
      {},
      {
        withCredentials: true, // 쿠키를 요청에 포함시킴
      }
    );
    console.log("이전 랭킹이 성공적으로 저장되었습니다:", rankingReset.data);

    // P4P 배열 데이터를 개별적으로 서버에 전송
    for (const p4pData of p4pFormArray.value) {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/p4p`,
        p4pData,
        {
          withCredentials: true, // 쿠키를 요청에 포함시킴
        }
      );
      console.log("성공적으로 전송되었습니다:", response.data);
    }

    // 모든 데이터 전송이 완료된 후 로그 저장 요청
    const logResponse = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/p4p/log`,
      {},
      {
        withCredentials: true, // 쿠키를 요청에 포함시킴
      }
    );
    console.log("로그가 성공적으로 저장되었습니다:", logResponse.data);

    // 전송 후 배열 초기화
    p4pFormArray.value = [];
  } catch (error) {
    console.error("전송 중 오류 발생:", error);
  } finally {
    alert("복서 P4P데이터가 전송되었습니다!");
    fetchboxers();
  }
};

/* 해당 로직은 for문쳐서 하는것 Promise all로 개선할 수 있음.
const insertP4P = async () => {
  try {
    const rankingReset = await axios.post('http://localhost:8080/api/p4p/reset', {}, {
      withCredentials: true,
    });
    console.log('이전 랭킹이 성공적으로 저장되었습니다:', rankingReset.data);

    // P4P 배열 데이터를 병렬적으로 서버에 전송
    const promises = p4pFormArray.value.map(p4pData =>
      axios.post('http://localhost:8080/api/p4p', p4pData, { withCredentials: true })
    );
    const responses = await Promise.all(promises);
    responses.forEach(response => console.log('성공적으로 전송되었습니다:', response.data));

    // 로그 저장
    const logResponse = await axios.post('http://localhost:8080/api/p4p/log', {}, {
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

onMounted(() => {
  p4pStore.fetchP4PData();
});

const beforeEnter = (el) => {
  el.style.opacity = 0;
};

const enter = (el, done) => {
  const delay = el.style.animationDelay || "0s";
  setTimeout(() => {
    el.style.opacity = 1;
    done();
  }, parseFloat(delay) * 1000); // Convert delay to ms
};

const getAnimationDelay = (index) => {
  return {
    animationDelay: `${index * 0.2}s`, // 0.1s delay between each card
  };
};

// Example Data
const removeBoxer = (index) => {
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

.boxer-list {
  cursor: pointer;
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

.boxer-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
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

/* 선택복서 P4P입력 폼 */
.select-form {
  width: 50%;
  margin: 0 auto;
}

.submit-button {
  display: block;
  margin: 0 auto;
}

.search-input-box {
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: center;
  width: 30%;
  margin: 0 auto;
}
.search-label {
  font-size: 2rem;
  margin: 0;
}
.search-input {
  width: 100%;
}
</style>
