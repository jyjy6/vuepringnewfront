<template>
  <v-container fluid class="px-4 px-md-16">
    <v-row no-gutters>
      <!-- News Section -->
      <v-col cols="12" md="8" class="pr-md-6">
        <v-card flat outlined class="pa-4 rounded-lg elevation-2">
          <v-list>
            <v-list-group
              v-for="(news, index) in limitedNewsData"
              :key="index"
              no-action
              color="primary"
            >
              <template v-slot:activator="{ props }">
                <v-list-item
                  v-bind="props"
                  :prepend-avatar="imgSrc[index]"
                  :title="news.title"
                  class="rounded-lg hover-effect"
                >
                  <template v-slot:prepend>
                    <v-avatar size="56" class="mr-4">
                      <v-img :src="imgSrc[index]" cover></v-img>
                    </v-avatar>
                  </template>
                </v-list-item>
              </template>

              <v-list-item @click="openNewsModal(index)">
                <v-list-item-content>
                  <div
                    v-html="news.content"
                    class="text-body-2 line-clamp-3"
                  ></div>
                  <v-list-item-subtitle class="mt-2 text-grey-darken-1">
                    {{ news.author }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list-group>
          </v-list>

          <v-progress-linear
            v-if="newsDataStore.loading"
            indeterminate
            color="primary"
          ></v-progress-linear>

          <v-btn
            v-else
            block
            color="primary"
            variant="elevated"
            @click="moreNews"
            class="mt-4"
          >
            더보기
          </v-btn>
        </v-card>
      </v-col>

      <!-- Ads Section -->
      <v-col cols="12" md="4">
        <v-card flat outlined class="pa-4 rounded-lg elevation-2">
          <v-card-title class="text-h6 mb-4"> 광고 </v-card-title>
          <v-sheet class="d-flex flex-column ga-4">
            <v-card
              v-for="i in 6"
              :key="i"
              outlined
              height="200"
              class="d-flex align-center justify-center"
              variant="tonal"
              color="secondary"
            >
              광고 {{ i }}
            </v-card>
          </v-sheet>
        </v-card>
      </v-col>
    </v-row>

    <!-- News Modal -->
    <v-dialog v-model="isModalOpen" max-width="800px">
      <v-card v-if="selectedNews" class="rounded-lg">
        <v-card-title class="text-h5 bg-primary text-white pa-4">
          {{ selectedNews.title }}
        </v-card-title>
        <v-card-text class="pa-6">
          <div v-html="selectedNews.content" class="text-body-1"></div>
          <v-card-subtitle class="mt-4 text-grey-darken-1">
            {{ selectedNews.author }}
          </v-card-subtitle>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="isModalOpen = false">
            닫기
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import { useNewsDataStore } from "../store/newsDataStore";
import { News } from "../types/NewsTypes";

const selectedNews = ref<News>();

const openNewsModal = (index: number) => {
  selectedNews.value = limitedNewsData.value[index];
  isModalOpen.value = true;
};

const newsDataStore = useNewsDataStore();

onMounted(() => {
  newsDataStore.fetchNewsData().then(() => {
    nextTick(() => {
      findFirstImage();
    });
  });
});

let newsDataCount = ref(3);
const newsData = computed(() => newsDataStore.newsData);
const limitedNewsData = computed((): News[] =>
  newsData.value.slice(0, newsDataCount.value)
);

// newsDataCount.
function moreNews() {
  newsDataCount.value += 2;
  nextTick(() => {
    findFirstImage();
  });
}
const activeIndex = ref(-1); // 현재 활성화된 아코디언 항목의 인덱스, 기본값은 -1로 설정

const toggle = (index: number): void => {
  activeIndex.value = activeIndex.value === index ? -1 : index;
};

const enter = (el: Element) => {
  const element = el as HTMLElement; // Element를 HTMLElement로 캐스팅
  element.style.maxHeight = "0";
  requestAnimationFrame(() => {
    element.style.maxHeight = element.scrollHeight + "px";
  });
};

const leave = (el: Element) => {
  const element = el as HTMLElement;
  element.style.maxHeight = element.scrollHeight + "px";
  requestAnimationFrame(() => {
    element.style.maxHeight = "0";
    element.style.maxHeight = "0";
  });
};

const isModalOpen = ref(false);

let imgSrc = reactive<string[]>([]);
// console.log(imgSrc[1])
onMounted(() => {
  findFirstImage();
});

function findFirstImage() {
  const accordionContents = document.querySelectorAll(".accordion-content");
  console.log(accordionContents);
  accordionContents.forEach((content, index) => {
    const img = content.querySelector("img");
    if (img) {
      imgSrc[index] = img.src; // 첫 번째 이미지의 주소를 imgSrc에 저장
    } else {
      imgSrc[index] = ""; // 이미지가 없으면 빈 문자열
    }
  });
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hover-effect:hover {
  background-color: rgb(var(--v-theme-primary), 0.1);
}
</style>
../types/NewsTypes
