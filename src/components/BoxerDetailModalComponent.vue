<template>
  <v-dialog
    v-model="boxerDataStore.modalOpen"
    @click:outside="$emit('close')"
    max-width="800"
    scrollable
  >
    <v-card v-if="selectedBoxer !== null">
      <v-card-title class="d-flex justify-space-between">
        <span>{{ props.boxers[props.selectedBoxer].name }} 선수 정보</span>
        <v-btn icon @click="boxerDataStore.modalOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-img
              :src="props.boxers[selectedBoxer].boxerImg"
              aspect-ratio="1"
              class="rounded-lg"
            ></v-img>
          </v-col>

          <v-col cols="12" md="8">
            <v-row>
              <v-col cols="6">
                <v-list dense>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>체급</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ props.boxers[selectedBoxer].division }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>랭킹</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ props.boxers[selectedBoxer].ranking }}위
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>RATING</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ ratingStar() }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>

              <v-col cols="6">
                <v-list dense>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>국적</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ props.boxers[selectedBoxer].country }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>키</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ props.boxers[selectedBoxer].height }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>리치</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ props.boxers[selectedBoxer].reach }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <v-row>
              <v-col cols="12" md="6">
                <v-list dense>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>타이틀</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ props.boxers[selectedBoxer].title }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>출생명</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ props.boxers[selectedBoxer].birthname }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>성별</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ props.boxers[selectedBoxer].sex }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>나이</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ props.boxers[selectedBoxer].age }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>

              <v-col cols="12" md="6">
                <v-list dense>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>총 전적</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ props.boxers[selectedBoxer].bouts }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>KO률</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ props.boxers[selectedBoxer].ko }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>고향</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ props.boxers[selectedBoxer].birthplace }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          text
          :to="`/admin/boxermodify/${props.boxers[selectedBoxer].id}`"
        >
          복서정보수정
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { Boxer } from "../types/BoxerTypes";
import { useBoxerDataStore } from "../store/boxerDataStore";

const props = defineProps<{
  selectedBoxer: number;
  boxers: Boxer[]; // Boxer 타입 정의 필요
}>();

const boxerDataStore = useBoxerDataStore();

// 키보드 이벤트 핸들러
const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    boxerDataStore.modalOpen = false;
  }
};

onMounted(() => {
  console.log("복서모달 열림");
  window.addEventListener("keydown", handleEscKey);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleEscKey);
  boxerDataStore.modalOpen = false;
});

// 별점 함수
const ratingStar = () => {
  if (props.selectedBoxer === null || props.selectedBoxer === undefined)
    return "";

  let stars = "";
  const rating = props.boxers[props.selectedBoxer]?.rating || 0;
  for (let i = 0; i < rating; i++) {
    stars += "🌟";
  }
  return stars;
};
</script>

<style></style>

<script lang="ts">
export default {
  name: "BoxerDetailModalComponent",
};
</script>
