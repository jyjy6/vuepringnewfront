<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div>
          <h2>1:1 상담 관리</h2>
          <p class="text-subtitle-1">모든 상담 내역을 관리합니다</p>
        </div>
        <v-btn color="primary" prepend-icon="mdi-refresh" @click="refreshData">
          새로고침
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="selectedStatus"
              :items="statusOptions"
              label="상담 상태"
              @update:model-value="handleStatusChange"
            ></v-select>
          </v-col>
        </v-row>

        <v-data-table
          :headers="headers"
          :items="chatStore.chatData"
          :loading="chatStore.loading"
          hover
          class="elevation-1"
        >
          <template v-slot:item.timestamp="{ item }">
            {{ formatDateTime(item.timestamp as string) }}
          </template>

          <template v-slot:item.message="{ item }">
            <div class="text-truncate" style="max-width: 300px">
              {{ item.message }}
            </div>
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip
              :color="item.status === '진행중' ? 'primary' : 'success'"
              size="small"
            >
              {{ item.status }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn
              size="small"
              color="primary"
              variant="text"
              icon="mdi-message-text"
              @click="openChatRoom(item.room)"
              class="mr-2"
            ></v-btn>

            <v-btn
              size="small"
              :color="item.status === '진행중' ? 'success' : 'primary'"
              variant="text"
              :icon="
                item.status === '진행중' ? 'mdi-check-circle' : 'mdi-refresh'
              "
              @click="toggleChatStatus(item)"
            ></v-btn>
          </template>

          <template v-slot:bottom>
            <v-pagination
              v-model="chatStore.currentPage"
              :length="chatStore.totalPages"
              rounded="circle"
              @update:model-value="handlePageChange"
            ></v-pagination>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- 채팅방 다이얼로그 -->
    <v-dialog
      v-model="chatDialogOpen"
      @click:outside="closeChatRoom()"
      max-width="800px"
      persistent
    >
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <div>상담방: {{ selectedRoom }}</div>
          <v-btn icon="mdi-close" variant="text" @click="closeChatRoom"></v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <ChatRoomComponent
            v-if="chatDialogOpen"
            :username="adminUsername"
            :room="selectedRoom"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="text"
            @click="completeChatSession"
            :disabled="selectedChatStatus !== '진행중'"
          >
            상담 완료
          </v-btn>
          <v-btn color="grey" variant="text" @click="closeChatRoom">
            닫기
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 스낵바 알림 -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">닫기</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useChatStore } from "../../store/chatStore";
import ChatRoomComponent from "../../components/ChatRoomComponent.vue";
import { useLoginStore } from "../../store/loginStore";
import { useSecureApi } from "../../composables/useSecureApi";

const chatStore = useChatStore();
const loginStore = useLoginStore();

// 관리자 사용자명
const adminUsername = computed(() => loginStore.getUser?.username || "admin");

// 테이블 헤더 정의
const headers = [
  { title: "방 번호", key: "room" },
  { title: "사용자", key: "username" },
  { title: "최근 메시지", key: "message" },
  { title: "시간", key: "timestamp" },
  { title: "상태", key: "status" },
  { title: "작업", key: "actions", sortable: false },
];

// 채팅방 선택 상태
const selectedRoom = ref("");
const selectedChatStatus = ref("진행중");
const chatDialogOpen = ref(false);

// 상담 상태 필터
const selectedStatus = ref("all");
const statusOptions = [
  { title: "전체", value: "all" },
  { title: "진행중", value: "진행중" },
  { title: "완료", value: "완료" },
];

// 스낵바 알림 상태
const snackbar = ref({
  show: false,
  text: "",
  color: "success",
});

// 상담 데이터 새로고침
const refreshData = () => {
  chatStore.fetchAllChatData();
};

// 상태 필터 변경 처리
const handleStatusChange = () => {
  chatStore.currentPage = 1;
  chatStore.fetchFilteredChatData(selectedStatus.value);
};

// 페이지 변경 처리
const handlePageChange = (page: number) => {
  chatStore.setPage(page);
};

// 채팅방 열기
const openChatRoom = (room: string) => {
  selectedRoom.value = room;

  // 현재 채팅 상태 확인
  const chatItem = chatStore.chatData.find((chat) => chat.room === room);
  if (chatItem) {
    selectedChatStatus.value = chatItem.status as string;
  }

  chatDialogOpen.value = true;
};

// 채팅방 닫기
const closeChatRoom = () => {
  chatDialogOpen.value = false;
  selectedRoom.value = "";
  // 데이터 갱신
  refreshData();
};

const api = useSecureApi();

// 채팅 상태 전환
const toggleChatStatus = async (chat: any) => {
  try {
    const newStatus = chat.status === "진행중" ? "완료" : "진행중";

    await api.securePut(`/api/chat/status/${chat.room}`, {
      status: newStatus,
    });

    // 성공 후 데이터 갱신
    refreshData();

    // 성공 메시지 표시
    snackbar.value = {
      show: true,
      text: `상담이 ${newStatus} 상태로 변경되었습니다.`,
      color: "success",
    };
  } catch (error) {
    console.error("상태 변경 실패:", error);
    snackbar.value = {
      show: true,
      text: "상태 변경에 실패했습니다.",
      color: "error",
    };
  }
};

// 현재 열린 상담 완료 처리
const completeChatSession = async () => {
  if (!selectedRoom.value) return;

  try {
    await api.securePut(`/api/chat/status/${selectedRoom.value}`, {
      status: "완료",
    });

    selectedChatStatus.value = "완료";

    snackbar.value = {
      show: true,
      text: "상담이 완료 처리되었습니다.",
      color: "success",
    };
  } catch (error) {
    console.error("상담 완료 처리 실패:", error);
    snackbar.value = {
      show: true,
      text: "상담 완료 처리에 실패했습니다.",
      color: "error",
    };
  }
};

// 날짜 포맷팅
const formatDateTime = (dateString: string) => {
  if (!dateString) return "";
  const options: any = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("ko-KR", options);
};

onMounted(() => {
  // 초기 데이터 로드
  chatStore.fetchAllChatData();
});
</script>

<style scoped>
.v-data-table ::v-deep .v-data-table__wrapper {
  min-height: 500px;
}
</style>
