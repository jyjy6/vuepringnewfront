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

      <!-- Tiptap 에디터 -->
      <div class="editor-container mb-4">
        <!-- 에디터 툴바 -->
        <v-card class="mb-2">
          <v-toolbar density="compact" flat>
            <v-btn
              icon
              @click="editor?.chain().focus().toggleBold().run()"
              :class="{ 'active-btn': editor?.isActive('bold') }"
            >
              <v-icon>mdi-format-bold</v-icon>
            </v-btn>
            <v-btn
              icon
              @click="editor?.chain().focus().toggleItalic().run()"
              :class="{ 'active-btn': editor?.isActive('italic') }"
            >
              <v-icon>mdi-format-italic</v-icon>
            </v-btn>
            <v-btn
              icon
              @click="editor?.chain().focus().toggleUnderline().run()"
              :class="{ 'active-btn': editor?.isActive('underline') }"
            >
              <v-icon>mdi-format-underline</v-icon>
            </v-btn>
            <v-divider vertical class="mx-2"></v-divider>

            <v-btn
              icon
              @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
              :class="{
                'active-btn': editor?.isActive('heading', { level: 1 }),
              }"
            >
              <v-icon>mdi-format-header-1</v-icon>
            </v-btn>
            <v-btn
              icon
              @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
              :class="{
                'active-btn': editor?.isActive('heading', { level: 2 }),
              }"
            >
              <v-icon>mdi-format-header-2</v-icon>
            </v-btn>
            <v-btn
              icon
              @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
              :class="{
                'active-btn': editor?.isActive('heading', { level: 3 }),
              }"
            >
              <v-icon>mdi-format-header-3</v-icon>
            </v-btn>
            <v-divider vertical class="mx-2"></v-divider>

            <v-btn
              icon
              @click="editor?.chain().focus().toggleBlockquote().run()"
              :class="{ 'active-btn': editor?.isActive('blockquote') }"
            >
              <v-icon>mdi-format-quote-close</v-icon>
            </v-btn>
            <v-btn
              icon
              @click="editor?.chain().focus().setHorizontalRule().run()"
            >
              <v-icon>mdi-minus</v-icon>
            </v-btn>
            <v-divider vertical class="mx-2"></v-divider>

            <v-btn icon @click="editor?.chain().focus().undo().run()">
              <v-icon>mdi-undo</v-icon>
            </v-btn>
            <v-btn icon @click="editor?.chain().focus().redo().run()">
              <v-icon>mdi-redo</v-icon>
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
              @change="uploadImage"
            ></v-file-input>
          </v-toolbar>
        </v-card>

        <!-- 에디터 콘텐츠 영역 -->
        <div class="editor-content-wrapper">
          <editor-content :editor="editor" class="editor-content" />
        </div>
      </div>

      <!-- 저장 버튼 -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="savePost">저장</v-btn>
      </v-card-actions>
    </v-card>

    <!-- S3 업로드 진행 상태 표시 -->
    <v-dialog v-model="uploading" persistent width="300">
      <v-card>
        <v-card-text>
          이미지 업로드 중...
          <v-progress-linear indeterminate color="primary"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, shallowRef } from "vue";
import axios from "axios";
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useSecureApi } from "../composables/useSecureApi";

// 상태 관리
const title = ref("");
const imageFile = ref<File | null>(null);
const uploading = ref(false);
const fileURLs = ref<string[]>([]);

const props = defineProps<{
  URL: string;
}>();

// Tiptap 에디터 설정
const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
    Image,
    Link.configure({
      openOnClick: false,
    }),
  ],
  content: "",
  editorProps: {
    attributes: {
      class:
        "prose prose-sm sm:prose lg:prose-lg mx-auto focus:outline-none p-4",
    },
  },
});

const api = useSecureApi();

// S3 이미지 업로드 함수
const uploadImage = async () => {
  try {
    if (!imageFile.value || !editor.value) return;

    uploading.value = true;

    // 1. 백엔드에서 presigned URL 요청
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/images/presigned-url`,
      {
        params: {
          filename: imageFile.value.name,
          role: "USER",
        },
      }
    );

    const presignedUrl = response.data.presignedUrl;
    const imageUrl: string = response.data.imageUrl;
    await axios.put(presignedUrl, imageFile.value, {});

    fileURLs.value.push(imageUrl);

    // 3. 업로드 성공 후 에디터에 이미지 삽입
    editor.value
      .chain()
      .focus()
      .setImage({ src: imageUrl, alt: imageFile.value.name })
      .run();

    // 4. 파일 입력 초기화
    imageFile.value = null;
  } catch (error) {
    console.error("이미지 업로드 중 오류 발생:", error);
    alert("이미지 업로드에 실패했습니다.");
  } finally {
    uploading.value = false;
  }
};

// 포스트 저장
const savePost = async () => {
  if (!editor.value) return;

  try {
    const postData = {
      title: title.value,
      content: editor.value.getHTML(),
      fileURLs: fileURLs.value,
    };

    const response = await api.secureJWTPost(
      `${import.meta.env.VITE_API_BASE_URL}` + props.URL,
      postData
    );
    console.log("성공적으로 전송되었습니다:", response.data);
    window.location.reload();
    alert("포스트가 저장되었습니다!");
  } catch (error) {
    console.error("포스트 저장 중 오류 발생:", error);
    alert("포스트 저장에 실패했습니다.");
  }
};

// 컴포넌트 언마운트 시 에디터 정리
onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<style scoped>
.editor-container {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}

.editor-content-wrapper {
  min-height: 400px;
  max-height: 600px;
  overflow-y: auto;
}

.editor-content {
  height: 100%;
}

.active-btn {
  background-color: rgba(0, 0, 0, 0.1);
}

:deep(.ProseMirror) {
  outline: none;
  min-height: 300px;
}

:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  color: #adb5bd;
  content: "내용을 입력하세요...";
  float: left;
  height: 0;
  pointer-events: none;
}
</style>
<script lang="ts">
export default {
  name: "EditorComponent",
};
</script>
