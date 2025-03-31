<template>
  <v-container>
    <v-card class="pa-4">
      <v-card-title>블로그 포스트 작성</v-card-title>

      <!-- 제목 입력 -->
      <v-text-field
        v-model="title"
        label="제목"
        variant="outlined"
        class="mb-4"
      ></v-text-field>

      <!-- 에디터 툴바 -->
      <v-card class="mb-2">
        <v-toolbar density="compact" flat>
          <v-btn icon @click="formatText('bold')">
            <v-icon>mdi-format-bold</v-icon>
          </v-btn>
          <v-btn icon @click="formatText('italic')">
            <v-icon>mdi-format-italic</v-icon>
          </v-btn>
          <v-btn icon @click="formatText('underline')">
            <v-icon>mdi-format-underline</v-icon>
          </v-btn>
          <v-divider vertical class="mx-2"></v-divider>
          <v-btn icon @click="formatHeading('h1')">
            <v-icon>mdi-format-header-1</v-icon>
          </v-btn>
          <v-btn icon @click="formatHeading('h2')">
            <v-icon>mdi-format-header-2</v-icon>
          </v-btn>
          <v-btn icon @click="formatHeading('h3')">
            <v-icon>mdi-format-header-3</v-icon>
          </v-btn>
          <v-divider vertical class="mx-2"></v-divider>
          <v-btn icon @click="formatList('ul')">
            <v-icon>mdi-format-list-bulleted</v-icon>
          </v-btn>
          <v-divider vertical class="mx-2"></v-divider>
          <v-file-input
            v-model="imageFile"
            hide-details
            density="compact"
            label="이미지 업로드"
            prepend-icon="mdi-image"
            variant="outlined"
            class="ml-2"
            style="max-width: 250px"
          ></v-file-input>
        </v-toolbar>
      </v-card>

      <!-- 에디터 본문 -->
      <v-textarea
        v-model="content"
        variant="outlined"
        label="내용"
        rows="15"
        auto-grow
        class="content-editor mb-4"
      ></v-textarea>

      <!-- 업로드된 이미지 미리보기 -->
      <!-- <div v-if="uploadedImages.length > 0" class="mb-4">
        <h3 class="mb-2">업로드된 이미지</h3>
        <v-row>
          <v-col
            v-for="(image, index) in uploadedImages"
            :key="index"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-card>
              <v-img :src="image.url" height="200" cover></v-img>
              <v-card-actions>
                <v-btn
                  color="primary"
                  block
                  @click="insertImageToEditor(image.url)"
                >
                  본문에 삽입
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </div> -->

      <!-- 미리보기 -->
      <v-expansion-panels class="mb-4">
        <v-expansion-panel>
          <v-expansion-panel-title>미리보기</v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-card flat>
              <v-card-title>{{ title || "제목 없음" }}</v-card-title>
              <v-divider></v-divider>
              <v-card-text
                class="preview-content"
                v-html="renderedContent"
              ></v-card-text>
            </v-card>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- 저장 버튼 -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="savePost">저장</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import axios from "axios";
// @ts-ignore
import { marked } from "marked";

// 상태 관리
const title = ref("");
const content = ref("");
const imageFile = ref(null);
const uploadedImages = ref([]);

// AWS S3 업로드 함수
// const uploadImage = async () => {
//   try {
//     if (!imageFile.value) return;

//     // 1. 백엔드에서 presigned URL 요청
//     const response = await axios.post("/api/get-presigned-url", {
//       filename: imageFile.value.name,
//       contentType: imageFile.value.type,
//     });

//     const { presignedUrl, imageUrl } = response.data;

//     // 2. Presigned URL을 사용하여 S3에 직접 업로드
//     await axios.put(presignedUrl, imageFile.value, {
//       headers: {
//         "Content-Type": imageFile.value.type,
//       },
//     });

//     // 3. 업로드 성공 후 이미지 목록에 추가
//     uploadedImages.value.push({
//       url: imageUrl,
//       name: imageFile.value.name,
//     });

//     // 4. 파일 입력 초기화
//     imageFile.value = null;
//   } catch (error) {
//     console.error("이미지 업로드 중 오류 발생:", error);
//     alert("이미지 업로드에 실패했습니다.");
//   }
// };

// // 에디터에 이미지 삽입
// const insertImageToEditor = (imageUrl) => {
//   const imageMarkdown = `\n![이미지](${imageUrl})\n`;
//   const currentPosition = document.querySelector(
//     ".content-editor textarea"
//   ).selectionStart;

//   content.value =
//     content.value.substring(0, currentPosition) +
//     imageMarkdown +
//     content.value.substring(currentPosition);
// };

// 텍스트 서식 지정 함수
const formatText = (format: "bold" | "italic" | "underline") => {
  const textarea: HTMLTextAreaElement | null = document.querySelector(
    ".content-editor textarea"
  );
  if (!textarea) return; // textarea가 null인 경우 함수 종료

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = content.value.substring(start, end);

  let formattedText = "";

  switch (format) {
    case "bold":
      formattedText = `**${selectedText}**`;
      break;
    case "italic":
      formattedText = `*${selectedText}*`;
      break;
    case "underline":
      formattedText = `<u>${selectedText}</u>`;
      break;
    default:
      formattedText = selectedText;
  }

  content.value =
    content.value.substring(0, start) +
    formattedText +
    content.value.substring(end);

  // 포커스 복원
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(start, start + formattedText.length);
  }, 0);
};

// 제목 형식 지정
const formatHeading = (level: "h1" | "h2" | "h3") => {
  const textarea: HTMLTextAreaElement | null = document.querySelector(
    ".content-editor textarea"
  );
  if (!textarea) return; // textarea가 null인 경우 함수 종료

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = content.value.substring(start, end);

  let prefix = "";
  switch (level) {
    case "h1":
      prefix = "# ";
      break;
    case "h2":
      prefix = "## ";
      break;
    case "h3":
      prefix = "### ";
      break;
  }

  // 선택한 텍스트의 위치가 줄의 시작인지 확인
  const beforeSelected = content.value.substring(0, start);
  const isStartOfLine = beforeSelected.endsWith("\n") || start === 0;

  let formattedText = "";
  if (isStartOfLine) {
    formattedText = `${prefix}${selectedText}`;
  } else {
    formattedText = `\n${prefix}${selectedText}`;
  }

  content.value =
    content.value.substring(0, start) +
    formattedText +
    content.value.substring(end);

  // 포커스 복원
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(
      start + formattedText.length,
      start + formattedText.length
    );
  }, 0);
};

// 리스트 형식 지정
const formatList = (type: any) => {
  const textarea: HTMLTextAreaElement | null = document.querySelector(
    ".content-editor textarea"
  );
  if (!textarea) return; // textarea가 null인 경우 함수 종료

  const start = textarea.selectionStart;

  let prefix = "";
  switch (type) {
    case "ul":
      prefix = "- ";
      break;
    // case "ol":
    //   prefix = "1. ";
    //   break;
  }

  // 선택한 텍스트의 위치가 줄의 시작인지 확인
  const beforeSelected = content.value.substring(0, start);
  const isStartOfLine = beforeSelected.endsWith("\n") || start === 0;

  let formattedText = "";
  if (isStartOfLine) {
    formattedText = `${prefix}`;
  } else {
    formattedText = `\n${prefix}`;
  }

  content.value =
    content.value.substring(0, start) +
    formattedText +
    content.value.substring(start);

  // 포커스 복원
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(
      start + formattedText.length,
      start + formattedText.length
    );
  }, 0);
};

// 마크다운을 HTML로 변환
const renderedContent = computed(() => {
  return marked(content.value);
});

// 포스트 저장
const savePost = async () => {
  try {
    // 실제 구현시에는 여기에 POST 요청 코드 작성
    console.log("저장할 포스트:", {
      title: title.value,
      content: content.value,
      images: uploadedImages.value,
    });

    alert("포스트가 저장되었습니다!");
  } catch (error) {
    console.error("포스트 저장 중 오류 발생:", error);
    alert("포스트 저장에 실패했습니다.");
  }
};
</script>

<style scoped>
.preview-content {
  padding: 16px;
}
.preview-content img {
  max-width: 100%;
  height: auto;
}
</style>
<script lang="ts">
export default {
  name: "EdtiorComponent",
};
</script>
