<template>
  <div class="curr-P4P-top3">
    <h1 class="ranking-title">CURRENT POUND FOR POUND TOP 3</h1>
    <div
      class="ranking-list"
      v-for="(player, index) in p4pTop10?.slice(0, 3)"
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
  </div>
  <hr class="divider" />

  <v-container class="home-contents-container">
    <v-row>
      <!-- Latest News -->
      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <v-card-title>Latest News</v-card-title>
          <v-card-text class="news-list">
            <v-card
              class="news-card mb-4"
              v-for="news in limitedNewsData"
              :key="news.id"
            >
              <v-card-text>
                <h3 v-html="news.title"></h3>
                <p class="news-preview" v-html="news.content"></p>
                <router-link :to="`/news/`" class="read-more"
                  >Read more</router-link
                >
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Home Video -->
      <v-col v-if="homeVideoData" cols="12" md="6">
        <v-card class="home-video pa-4">
          <v-card-title class="text-h5 text-wrap">{{
            homeVideoData.title
          }}</v-card-title>
          <v-card-text class="pa-0">
            <v-responsive aspect-ratio="16/9" class="mb-4">
              <iframe
                width="100%"
                height="100%"
                :src="`https://www.youtube.com/embed/${extractVideoId(
                  homeVideoData.link
                )}`"
                frameborder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </v-responsive>
            <div class="content-wrapper overflow-auto">
              <div v-html="homeVideoData.content"></div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<!-- tiptap으로 이미지 바인딩하기. -->

<!-- 
Shop
장바구니기능 - > 로그인한놈한테만
select의 value가 모두 채워지면
총 결제가격에 + 하고 select옵션 초기화
선택된 상품들 보여주면서 X누르면 지우기
ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
스케쥴,
1. 매치 날짜, 장소 리스트로 만들어놓음(어드민페이지에서 관리)
2. 리스트 누르면 해당 날짜, 장소등이 적혀있는 페이지로 이동
3. 페이지엔 승, 패 선택하는게 있음 승, 패 선택해서 해당 복서 DB에 승리같은 정보 저장
4. [예정] 으로 돼있는걸 [결과] 등으로 바꾸고 승, 패 아이콘 달면될듯
5. 페이지네이션.
6. result에 저장 버튼눌러서 결과 저장하는것도 생각해보기(스케쥴/result로 해보는것도 고려)
ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ


홈
1. 최근뉴스 -> 이건 뉴스페이지에서 가장 최근에 작성한애들 데려와서 조금 보여주기
2. 추천복싱영상->
랜덤으로 알아서(하루마다 자기가 바꾸게 하던가), 운영자 페이지에 폼 작성(간단하게 A vs B 어떤경기인지정도만 하고 유튜브 링크 걸면 될 듯)


-->

<script setup lang="ts">
import axios from "axios";
import { computed, onMounted, ref } from "vue";
import { useP4PStore } from "../store/p4pStore";
import { useNewsDataStore } from "../store/newsDataStore";

interface HomeVideoData {
  id: number;
  author: string;
  link: string;
  title: string;
  content: string;
}

const homeVideoData = ref<HomeVideoData | undefined>(undefined);

const fetchVideos = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/homevideo`,
      {}
    );
    homeVideoData.value = response.data; // 응답 데이터가 배열이라면 특정 요소로 접근해야 할 수도 있음
  } catch (error) {
    console.error("Error fetching videos:", error);
  }
};

const extractVideoId = (url: string): string | null => {
  try {
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get("v");
  } catch (error) {
    console.error("Invalid URL:", url);
    return null;
  }
};

// P4P 기능 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
const p4pStore = useP4PStore();
onMounted(() => {
  p4pStore.fetchP4PData();
  fetchVideos();
  newsDataStore.fetchNewsData();
});

const p4pTop10 = computed(() => p4pStore.p4pData);
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

const newsDataStore = useNewsDataStore();
const newsData = computed(() => newsDataStore.newsData);
const newsDataCount = ref(3);

const limitedNewsData = computed(() =>
  newsData.value.slice(0, newsDataCount.value)
);
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@100;200;300;400;500;600;700&family=Jua&family=Nanum+Brush+Script&family=Yeon+Sung&display=swap");
* {
  font-family: "IBM Plex Sans KR", sans-serif !important;
}

/* P4P 스타일 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ */
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
.ranking-title {
  font-size: 2.5rem; /* 폰트 크기 */
  font-weight: bold; /* 두껍게 */
  color: #e63946; /* 강렬한 색상 */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* 그림자 효과 */
  margin-bottom: 20px; /* 제목과 카드 사이의 여백 */
  font-family: "Arial", sans-serif; /* 글꼴 설정 */
  text-align: center;
}

.divider {
  border: none; /* 기본 테두리 제거 */
  border-top: 1.5px solid silver; /* 구분선 색상 및 두께 */
  margin: 20px 0; /* 여백 조정 */
  width: 70%; /* 구분선 너비 */
  margin-left: auto; /* 왼쪽 여백 자동 */
  margin-right: auto; /* 오른쪽 여백 자동 */
}
@media screen and (max-width: 1350px) {
  .divider {
    width: 80%;
  }
}
@media screen and (max-width: 950px) {
  .divider {
    width: 95%;
  }
}
@media screen and (max-width: 650px) {
  .divider {
    width: 100%;
  }
}

/* ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ */

.home-contents-container {
  display: flex;
  justify-content: center;
  align-items: flex-start; /* 세로 정렬을 시작으로 설정 */
  width: 70%;
  margin: 0 auto;
}

.home-video .v-card-title {
  word-break: break-word;
  white-space: normal;
  line-height: 1.4;
}

.home-video iframe {
  border-radius: 4px;
  height: 400px;
}

.content-wrapper {
  overflow-y: auto;
  padding: 16px 0;
}

.content-wrapper img {
  max-width: 100%;
  height: auto;
  overflow: visible;
}

.content-wrapper :deep(*) {
  max-width: 100%;
  overflow-wrap: break-word;
  overflow: visible;
}

.news-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  width: 100%;
}

.news-card {
  display: flex;
  flex-direction: column; /* 수직 정렬 */
  background-color: #f8f9fa; /* 카드 배경 색상 */
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  width: 100%; /* 카드 폭을 100%로 설정 */
  height: 250px; /* 카드 높이 설정 */
  overflow: hidden;
}

.news-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  width: 100%;
}

.news-content h3 {
  margin: 0;
  font-size: 20px;
  font-family: "Open Sans", sans-serif; /* 제목 폰트 설정 */
  color: #333; /* 제목 색상 */
}

.news-preview {
  margin: 10px 0;
  font-size: 16px;
  color: #666; /* 미리보기 텍스트 색상 */
  height: 60px; /* 미리보기 높이 설정 */
  overflow: hidden;
  position: relative;
  font-family: "Open Sans", sans-serif; /* 미리보기 폰트 설정 */
}

.news-preview::after {
  content: "...";
  position: absolute;
  bottom: 0;
  right: 0;
  background: linear-gradient(transparent, #f8f9fa 50%);
  width: 100%;
  height: 20px;
  text-align: right;
}

.read-more {
  font-size: 14px;
  color: #007bff; /* 링크 색상 */
  text-decoration: none;
  align-self: flex-end;
  font-weight: bold;
}

.read-more:hover {
  text-decoration: underline;
}

.btn-show-more {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff; /* 버튼 색상 */
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-show-more:hover {
  background-color: #0056b3; /* 호버 색상 */
}

.session-check-btn {
  margin-top: 20px; /* 버튼 위쪽 여백 */
  padding: 10px 20px;
  background-color: #007bff; /* 버튼 색상 */
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.session-check-btn:hover {
  background-color: #0056b3; /* 호버 색상 */
}

.session-status {
  margin-top: 10px; /* 상태 텍스트 위쪽 여백 */
  font-size: 16px; /* 상태 텍스트 크기 */
  color: #333; /* 상태 텍스트 색상 */
}

@media screen and (max-width: 850px) {
  .news-container {
    width: 90%; /* 작은 화면에서는 카드가 전체 폭 차지 */
    margin: 0 auto;
  }

  .home-contents-container {
    display: block;
    margin: 0;
    width: 100%;
  }

  .home-video > iframe {
    width: 100%; /* 비디오 폭을 100%로 설정 */
  }
}
</style>
