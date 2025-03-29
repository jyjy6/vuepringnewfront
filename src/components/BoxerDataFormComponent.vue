<template>
  <v-form @submit.prevent="submitForm" class="boxer-info-form">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-select
            v-model="form.division"
            :items="divisionItems"
            item-title="title"
            item-value="value"
            label="체급 (Division)"
            required
            outlined
          ></v-select>
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model="form.name"
            label="Name"
            placeholder="영어 / 한글명"
            outlined
            autofocus
          ></v-text-field>
        </v-col>

        <v-col cols="12">
          <v-row align="center">
            <v-col cols="3">
              <label>Rating:</label>
            </v-col>
            <v-col cols="9">
              <div class="star-rating">
                <v-rating
                  v-model="form.rating"
                  :length="5"
                  color="yellow-darken-2"
                  half-increments
                ></v-rating>
              </div>
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.bouts"
            label="Bouts"
            placeholder="총 전적"
            type="number"
            outlined
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.rounds"
            label="Rounds"
            placeholder="총 라운드 수"
            type="number"
            outlined
          ></v-text-field>
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model="form.ko"
            label="KOs"
            placeholder="KO률 ex)65.35"
            outlined
            @input="addPercentage"
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.career"
            label="Career"
            placeholder="커리어 시작년도 - 커리어 종료년도"
            outlined
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.debut"
            label="Debut"
            placeholder="데뷔일시"
            outlined
          ></v-text-field>
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model="form.title"
            label="Titles"
            placeholder="현재 보유 벨트(타이틀)"
            outlined
          ></v-text-field>
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model="form.birthname"
            label="Birth Name"
            placeholder="출생신고 이름(현지어)"
            outlined
          ></v-text-field>
        </v-col>

        <v-col cols="12">
          <v-radio-group v-model="form.sex" row>
            <v-radio label="남자" value="male"></v-radio>
            <v-radio label="여자" value="female"></v-radio>
          </v-radio-group>
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.age"
            label="Age"
            placeholder="만 나이"
            outlined
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.country"
            label="Country"
            placeholder="현재국적"
            outlined
          ></v-text-field>
        </v-col>

        <v-col cols="12">
          <v-radio-group v-model="form.stance" row>
            <v-radio label="오소독스" value="orthodox"></v-radio>
            <v-radio label="사우스포" value="southpaw"></v-radio>
            <v-radio label="스위칭히터" value="switch"></v-radio>
          </v-radio-group>
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.reach"
            label="Reach"
            placeholder="손가락 끝에서 손가락 끝까지의 길이"
            outlined
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.height"
            label="Height"
            placeholder="키"
            outlined
          ></v-text-field>
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model="form.birthplace"
            label="Birth Place"
            placeholder="태어난곳"
            outlined
          ></v-text-field>
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model="form.ranking"
            label="World Rank"
            placeholder="체급별 세계랭킹 입력"
            type="number"
            outlined
            @blur="setDefaultRank"
          ></v-text-field>
        </v-col>

        <v-col cols="12" v-if="form.boxerImg">
          <v-img :src="form.boxerImg" max-height="300" contain></v-img>
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model="form.author"
            label="데이터 작성자"
            placeholder="작성자이름"
            outlined
          ></v-text-field>
        </v-col>

        <v-col cols="12">
          <v-btn type="submit" color="primary" block large class="mt-4">
            전송
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script setup lang="ts">
import axios, { AxiosError } from "axios";
import { computed, ref, watch } from "vue";
import DivisionData from "../assets/DivisionData";
import { useBoxerDataStore } from "../store/boxerDataStore";
import { Boxer } from "../types/BoxerTypes";
import { useSecureApi } from "../composables/useSecureApi";

const props = defineProps<{
  modifyId?: number;
  isPut?: boolean;
}>();

const boxerDataStore = useBoxerDataStore();
watch(
  () => props.modifyId,
  async (newId) => {
    if (props.isPut && newId) {
      await boxerDataStore.getOneBoxer(newId);
      form.value = boxerDataStore.boxers[0];
    }
  },
  { immediate: true } // ✅ 컴포넌트 마운트 시에도 실행
);

// DivisionData의 `routerlink` 값을 가져와 `items`로 변환
const divisionItems = computed(() =>
  DivisionData.map((d) => ({
    title: d.divisions, // 셀렉트 박스에 표시될 값
    value: d.routerlink, // 선택 시 반환될 값
  }))
);

const form = ref<Boxer>({
  id: -1,
  division: "",
  name: "",
  rating: 0,
  bouts: 0,
  rounds: 0,
  ko: "",
  career: "",
  debut: "",
  title: "",
  birthname: "",
  sex: "male",
  age: 0,
  country: "",
  stance: "orthodox",
  reach: "",
  height: "",
  birthplace: "",
  ranking: null,
  author: "",
  boxerImg: "",
});

const addPercentage = (event: Event) => {
  const input = event.target as HTMLInputElement;
  let value = input.value;

  // Remove existing percentage sign
  value = value.replace("%", "");

  // Validate and update value
  if (!isNaN(Number(value))) {
    // Add percentage sign if not present
    if (value && !value.endsWith("%")) {
      value = value + "%";
    }

    form.value.ko = value;
  } else {
    // If not a number, clear the field
    form.value.ko = "";
  }
};

const setDefaultRank = () => {
  if (form.value.ranking === null) {
    form.value.ranking = 9999; // Default value when no input
  }
};

const api = useSecureApi();
const submitForm = async () => {
  if (props.isPut) {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/boxers/modify`,
        form.value
      );
      alert("잘 수정됐음" + response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("에러남" + error.response);
      }
    }
  }
  try {
    const response = await api.securePost(
      `${import.meta.env.VITE_API_BASE_URL}/api/boxers/add`,
      form.value
    );
    console.log("성공적으로 전송되었습니다:", response.data);
    window.location.reload(); // Reload the page
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with an error status code
        alert("오류 발생: " + error.response.data);
        console.error("오류 코드:", error.response.status);
        console.error("오류 데이터:", error.response.data);
      } else if (error.request) {
        // Request was made but no response received
        alert("요청이 만들어졌지만 응답이 없습니다.");
        console.error("요청 데이터:", error.request);
      } else {
        // Something happened in setting up the request
        alert("요청 중 문제가 발생했습니다: " + error.message);
        console.error("오류 메시지:", error.message);
      }
      console.error("전체 오류 객체:", error.config);
    }
  }
};
</script>

<style scoped>
.boxer-info-form {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  width: 70%;
  margin: 0 auto;
}
</style>
<script lang="ts">
export default {
  name: "BoxerDataFormComponent",
};
</script>
