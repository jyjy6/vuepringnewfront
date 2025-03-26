<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-sheet color="transparent">
          <v-toolbar flat color="transparent" class="mb-4">
            <v-toolbar-title class="text-h4 font-weight-bold">
              {{ formattedDivision }} 체급 선수 목록
            </v-toolbar-title>
          </v-toolbar>

          <v-row v-if="loading" justify="center">
            <v-col cols="12" class="text-center">
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
              ></v-progress-circular>
            </v-col>
          </v-row>

          <v-row v-else>
            <v-col
              v-for="(boxer, i) in boxers"
              :key="boxer.id"
              cols="12"
              sm="6"
              md="4"
            >
              <v-card
                hover
                @click="openBoxerModal(i)"
                class="boxer-card elevation-3"
              >
                <v-img
                  :src="boxer.boxerImg"
                  :aspect-ratio="16 / 9"
                  class="boxer-image"
                >
                  <v-chip
                    v-if="boxer.ranking === 1"
                    color="gold"
                    text-color="black"
                    small
                    class="ranking-chip champion"
                  >
                    챔피언
                  </v-chip>
                  <v-chip
                    v-else
                    color="primary"
                    text-color="white"
                    small
                    class="ranking-chip"
                  >
                    {{ boxer.ranking }}위
                  </v-chip>
                </v-img>

                <v-card-title>
                  {{ boxer.name }}
                </v-card-title>

                <v-card-subtitle>
                  {{ boxer.title }}
                </v-card-subtitle>

                <v-card-actions>
                  <v-btn
                    text
                    color="secondary"
                    :to="`/admin/boxermodify/${boxer.id}`"
                  >
                    복서정보수정
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-sheet>
      </v-col>
    </v-row>

    <v-dialog v-model="divisionModalOpen" max-width="800" scrollable>
      <v-card v-if="selectedBoxer !== null">
        <v-card-title class="d-flex justify-space-between">
          <span>{{ boxers[selectedBoxer].name }} 선수 정보</span>
          <v-btn icon @click="divisionModalOpen = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-img
                :src="boxers[selectedBoxer].boxerImg"
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
                          {{ boxers[selectedBoxer].division }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>랭킹</v-list-item-title>
                        <v-list-item-subtitle>
                          {{ boxers[selectedBoxer].ranking }}위
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
                          {{ boxers[selectedBoxer].country }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>키</v-list-item-title>
                        <v-list-item-subtitle>
                          {{ boxers[selectedBoxer].height }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>리치</v-list-item-title>
                        <v-list-item-subtitle>
                          {{ boxers[selectedBoxer].reach }}
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
                          {{ boxers[selectedBoxer].title }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>생년월일</v-list-item-title>
                        <v-list-item-subtitle>
                          {{ boxers[selectedBoxer].birthname }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>성별</v-list-item-title>
                        <v-list-item-subtitle>
                          {{ boxers[selectedBoxer].sex }}
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
                          {{ boxers[selectedBoxer].bouts }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>KO률</v-list-item-title>
                        <v-list-item-subtitle>
                          {{ boxers[selectedBoxer].ko }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>고향</v-list-item-title>
                        <v-list-item-subtitle>
                          {{ boxers[selectedBoxer].birthplace }}
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
            :to="`/admin/boxermodify/${boxers[selectedBoxer].id}`"
          >
            복서정보수정
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

const divisionModalOpen = ref(false);
const selectedBoxer = ref<number | null>(null);

interface Boxer {
  id: number;
  name: string;
  boxerImg: string;
}

interface BoxerDetail extends Boxer {
  title: string;
  birthname: string;
  birthplace: string;
  bouts: number;
  career: number;
  country: string;
  debut: string;
  division: string;
  height: string;
  reach: string;
  ko: string;
  rating: number;
  rounds: number;
  sex: string;
  ranking: number;
  stance: string;
}

const route = useRoute();
const boxers = ref<BoxerDetail[]>([]);
const loading = ref(true);

const formattedDivision = computed(() => {
  const division = route.params.division;
  if (typeof division === "string") {
    return division.replace(/([A-Z])/g, " $1").trim();
  }
  return "";
});

const fetchboxers = async () => {
  loading.value = true;
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/boxers?weightClass=${
        formattedDivision.value
      }`
    );
    boxers.value = response.data;
  } catch (error) {
    console.error("Error fetching boxers:", error);
  } finally {
    loading.value = false;
  }
};

watch(
  () => route.params.division,
  () => {
    fetchboxers();
  }
);

onMounted(fetchboxers);

const openBoxerModal = (index: number) => {
  selectedBoxer.value = index;
  divisionModalOpen.value = true;
};

const closeModal = () => {
  divisionModalOpen.value = false;
};

const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    closeModal();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleEscKey);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleEscKey);
});

function ratingStar() {
  let stars = "";
  const rating = boxers.value[selectedBoxer.value ?? 0]?.rating || 0;
  for (let i = 0; i < rating; i++) {
    stars += "🌟";
  }
  return stars;
}
</script>

<style scoped>
.boxer-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.boxer-card:hover {
  transform: scale(1.05);
}

.ranking-chip {
  position: absolute !important;
  top: 10px;
  left: 10px;
}

.ranking-chip.champion {
  background-color: gold !important;
  color: black !important;
}
</style>
