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

          <v-row v-if="boxerDataStore.loading" justify="center">
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

    <BoxerDetailModalComponent
      :selectedBoxer="selectedBoxer"
      :boxers="boxers"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useBoxerDataStore } from "../store/boxerDataStore";
import { Boxer } from "../types/BoxerTypes";
import BoxerDetailModalComponent from "../components/BoxerDetailModalComponent.vue";

const boxerDataStore = useBoxerDataStore();
const route = useRoute();
const boxers = computed((): Boxer[] => {
  return boxerDataStore.boxers;
});

const formattedDivision = computed(() => {
  const division = route.params.division;
  if (typeof division === "string") {
    return division.replace(/([A-Z])/g, " $1").trim();
  }
  return "";
});

watch(
  () => route.params.division,
  () => {
    boxerDataStore.fetchboxers(formattedDivision.value);
  }
);

onMounted(() => {
  boxerDataStore.fetchboxers(formattedDivision.value);
});

const selectedBoxer = ref<number>(0);

const openBoxerModal = (index: number) => {
  selectedBoxer.value = index;
  boxerDataStore.modalOpen = true;
};
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
