<template>
  <v-container>
    <v-form @submit.prevent="submitForm" class="custom-form">
      <h1 class="text-h4 mb-6 text-center primary--text">상품 등록</h1>

      <v-card class="mb-6 pa-4" elevation="2">
        <v-card-title class="primary--text">기본 정보</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.name"
                label="상품명"
                outlined
                dense
                required
                prepend-inner-icon="mdi-package-variant"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.price"
                label="가격"
                type="number"
                outlined
                dense
                required
                prefix="₩"
                prepend-inner-icon="mdi-currency-krw"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.shipping"
                label="배달사"
                outlined
                dense
                prepend-inner-icon="mdi-truck-delivery"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.manufacturer"
                label="제조사"
                outlined
                dense
                prepend-inner-icon="mdi-factory"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.brand"
                label="브랜드"
                outlined
                dense
                prepend-inner-icon="mdi-tag"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.condition"
                label="상품상태"
                outlined
                dense
                prepend-inner-icon="mdi-check-circle"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.origin"
                label="원산지"
                outlined
                dense
                prepend-inner-icon="mdi-map-marker"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- 이미지 업로드 섹션 -->
      <v-card class="mb-6" elevation="2">
        <v-card-title class="primary--text">상품 이미지</v-card-title>
        <v-card-text>
          <v-file-input
            v-model="files"
            label="파일 첨부 (이미지)"
            outlined
            dense
            accept="image/*"
            multiple
            prepend-icon="mdi-camera"
            @change="onFileChange"
            show-size
            chips
          ></v-file-input>

          <!-- 파일 업로드 완료 후 미리보기 섹션 -->
          <v-row v-if="(form.fileURLs as string[]).length > 0">
            <v-col cols="12">
              <h3 class="subtitle-1 font-weight-medium">
                샘플 이미지 미리보기
              </h3>
              <p class="caption">클릭시 확대 가능</p>
            </v-col>

            <v-col
              v-for="(fileURL, index) in form.fileURLs"
              :key="index"
              cols="6"
              md="3"
            >
              <v-card flat class="preview-container">
                <v-img
                  :src="fileURL"
                  aspect-ratio="1"
                  class="grey lighten-2 image-preview"
                  @click="openModal(fileURL)"
                  contain
                ></v-img>
              </v-card>
            </v-col>
          </v-row>

          <!-- 모달 다이얼로그 -->
          <v-dialog v-model="isModalOpen" max-width="800px">
            <v-card>
              <v-card-title class="headline">이미지 확대</v-card-title>
              <v-card-text class="text-center">
                <v-img :src="selectedImage" contain max-height="600"></v-img>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text @click="closeModal">닫기</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-card-text>
      </v-card>

      <!-- Options -->
      <v-card class="mb-6" elevation="2">
        <v-card-title class="primary--text">
          옵션 정보
          <v-spacer></v-spacer>
          <v-btn color="primary" small fab @click="addOption">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-expand-transition>
            <div v-if="form.options.length === 0" class="text-center pa-4">
              <v-icon large color="grey lighten-1">mdi-playlist-plus</v-icon>
              <p class="mt-2 grey--text">
                옵션이 없습니다. 추가 버튼을 눌러 옵션을 추가하세요.
              </p>
            </div>
          </v-expand-transition>

          <div
            v-for="(option, index) in form.options"
            :key="index"
            class="mb-4"
          >
            <v-sheet rounded elevation="1" class="pa-4">
              <div class="d-flex align-center mb-2">
                <h3 class="subtitle-1 font-weight-medium">
                  옵션 {{ index + 1 }}
                </h3>
                <v-spacer></v-spacer>
                <v-btn icon small @click="removeOption(index)">
                  <v-icon small color="error">mdi-delete</v-icon>
                </v-btn>
              </div>

              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="option.size"
                    label="사이즈"
                    outlined
                    dense
                    hide-details
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="option.color"
                    label="색상"
                    outlined
                    dense
                    hide-details
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="option.other"
                    label="기타"
                    outlined
                    dense
                    hide-details
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-sheet>
          </div>
        </v-card-text>
      </v-card>

      <!-- Benefits -->
      <v-card class="mb-6" elevation="2">
        <v-card-title class="primary--text">
          혜택 정보
          <v-spacer></v-spacer>
          <v-btn color="primary" small fab @click="addBenefit">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-expand-transition>
            <div v-if="form.benefits.length === 0" class="text-center pa-4">
              <v-icon large color="grey lighten-1">mdi-gift</v-icon>
              <p class="mt-2 grey--text">
                혜택이 없습니다. 추가 버튼을 눌러 혜택을 추가하세요.
              </p>
            </div>
          </v-expand-transition>

          <div
            v-for="(benefit, index) in form.benefits"
            :key="index"
            class="mb-4"
          >
            <v-sheet rounded elevation="1" class="pa-4">
              <div class="d-flex align-center mb-2">
                <h3 class="subtitle-1 font-weight-medium">
                  혜택 {{ index + 1 }}
                </h3>
                <v-spacer></v-spacer>
                <v-btn icon small @click="removeBenefit(index)">
                  <v-icon small color="error">mdi-delete</v-icon>
                </v-btn>
              </div>

              <v-row>
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="benefit.description"
                    label="혜택 설명"
                    outlined
                    dense
                    hide-details
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="benefit.amount"
                    label="혜택 금액"
                    type="number"
                    outlined
                    dense
                    hide-details
                    prefix="₩"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-sheet>
          </div>
        </v-card-text>
      </v-card>

      <!-- Shipping Info -->
      <v-card class="mb-6" elevation="2">
        <v-card-title class="primary--text">
          배송 정보
          <v-spacer></v-spacer>
          <v-btn color="primary" small fab @click="addShippingInfo">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-expand-transition>
            <div v-if="form.shippingInfo.length === 0" class="text-center pa-4">
              <v-icon large color="grey lighten-1">mdi-truck</v-icon>
              <p class="mt-2 grey--text">
                배송 정보가 없습니다. 추가 버튼을 눌러 배송 정보를 추가하세요.
              </p>
            </div>
          </v-expand-transition>

          <div
            v-for="(shipping, index) in form.shippingInfo"
            :key="index"
            class="mb-4"
          >
            <v-sheet rounded elevation="1" class="pa-4">
              <div class="d-flex align-center mb-2">
                <h3 class="subtitle-1 font-weight-medium">
                  배송 정보 {{ index + 1 }}
                </h3>
                <v-spacer></v-spacer>
                <v-btn icon small @click="removeShippingInfo(index)">
                  <v-icon small color="error">mdi-delete</v-icon>
                </v-btn>
              </div>

              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="shipping.type"
                    label="배송 유형"
                    outlined
                    dense
                    hide-details
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="3">
                  <v-checkbox
                    v-model="shipping.freeShipping"
                    label="무료 배송"
                    hide-details
                  ></v-checkbox>
                </v-col>

                <v-col cols="12" md="5">
                  <v-text-field
                    v-model="shipping.courier"
                    label="택배사"
                    outlined
                    dense
                    hide-details
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="shipping.islandAdditionalFee"
                    label="도서산간 추가 요금"
                    type="number"
                    outlined
                    dense
                    hide-details
                    prefix="₩"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-sheet>
          </div>
        </v-card-text>
      </v-card>

      <!-- Discounts -->
      <v-card class="mb-6" elevation="2">
        <v-card-title class="primary--text">
          할인 정보
          <v-spacer></v-spacer>
          <v-btn color="primary" small fab @click="addDiscount">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-expand-transition>
            <div v-if="form.discounts.length === 0" class="text-center pa-4">
              <v-icon large color="grey lighten-1">mdi-sale</v-icon>
              <p class="mt-2 grey--text">
                할인 정보가 없습니다. 추가 버튼을 눌러 할인 정보를 추가하세요.
              </p>
            </div>
          </v-expand-transition>

          <div
            v-for="(discount, index) in form.discounts"
            :key="index"
            class="mb-4"
          >
            <v-sheet rounded elevation="1" class="pa-4">
              <div class="d-flex align-center mb-2">
                <h3 class="subtitle-1 font-weight-medium">
                  할인 {{ index + 1 }}
                </h3>
                <v-spacer></v-spacer>
                <v-btn icon small @click="removeDiscount(index)">
                  <v-icon small color="error">mdi-delete</v-icon>
                </v-btn>
              </div>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="discount.grade"
                    label="등급"
                    outlined
                    dense
                    hide-details
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="discount.discountRate"
                    label="할인율"
                    type="number"
                    outlined
                    dense
                    hide-details
                    suffix="%"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-sheet>
          </div>
        </v-card-text>
      </v-card>

      <div class="text-center">
        <v-btn
          color="primary"
          large
          type="submit"
          elevation="2"
          class="px-8 text-button font-weight-bold"
        >
          <v-icon left>mdi-check</v-icon>
          상품 등록하기
        </v-btn>
      </div>
    </v-form>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useSecureApi } from "../../composables/useSecureApi";
import { useImageUpload } from "../../composables/useImageUpload";
import { watch } from "vue";

export default defineComponent({
  name: "shopinput",
  setup() {
    const files = ref<File[]>([]);
    const isModalOpen = ref<boolean>(false);
    const selectedImage = ref<string>("");

    const form = ref({
      name: "",
      price: null,
      fileURLs: [] as string[],
      shipping: "",
      manufacturer: "",
      brand: "",
      condition: "",
      origin: "",
      options: [] as any[],
      benefits: [] as any[],
      shippingInfo: [] as any[],
      discounts: [] as any[],
    });

    const { handleFileUpload, singleImgUrl } = useImageUpload();

    const onFileChange = async (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        await handleFileUpload(event, form.value.fileURLs);
      }
    };

    const openModal = (imgUrl: string) => {
      selectedImage.value = imgUrl;
      isModalOpen.value = true;
    };

    const closeModal = () => {
      isModalOpen.value = false;
    };

    const addOption = () => {
      form.value.options.push({ size: "", color: "", other: "" });
    };

    const removeOption = (index: number) => {
      form.value.options.splice(index, 1);
    };

    const addBenefit = () => {
      form.value.benefits.push({ description: "", amount: null });
    };

    const removeBenefit = (index: number) => {
      form.value.benefits.splice(index, 1);
    };

    const addShippingInfo = () => {
      form.value.shippingInfo.push({
        type: "",
        freeShipping: false,
        courier: "",
        islandAdditionalFee: 0,
      });
    };

    const removeShippingInfo = (index: number) => {
      form.value.shippingInfo.splice(index, 1);
    };

    const addDiscount = () => {
      form.value.discounts.push({ grade: "", discountRate: null });
    };

    const removeDiscount = (index: number) => {
      form.value.discounts.splice(index, 1);
    };

    const api = useSecureApi();
    const submitForm = async () => {
      try {
        const response = await api.securePost(
          `${import.meta.env.VITE_API_BASE_URL}/api/sales`,
          form.value
        );
        console.log("Response:", response.data);
        console.log(form.value);
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    };

    return {
      form,
      files,
      isModalOpen,
      selectedImage,
      onFileChange,
      handleFileUpload,
      openModal,
      closeModal,
      addOption,
      removeOption,
      addBenefit,
      removeBenefit,
      addShippingInfo,
      removeShippingInfo,
      addDiscount,
      removeDiscount,
      submitForm,
    };
  },
});
</script>

<style>
/* 사용자 정의 폰트 추가 - Google Fonts에서 'Noto Sans KR' */
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap");

.custom-form {
  font-family: "Noto Sans KR", sans-serif;
}

.custom-form .v-card {
  border-radius: 8px;
  overflow: hidden;
}

.custom-form .v-card__title {
  font-size: 1.25rem;
  font-weight: 500;
  padding: 16px 20px;
  background-color: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.custom-form .preview-container {
  transition: transform 0.2s;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
}

.custom-form .preview-container:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.custom-form .image-preview {
  object-fit: cover;
  width: 100%;
  height: 100%;
}
</style>
