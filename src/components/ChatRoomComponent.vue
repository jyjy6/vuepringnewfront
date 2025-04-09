<template>
  <div class="chat-container">
    <div class="chat-header">
      <h2>Room: {{ room }}</h2>
      <div class="connection-status" :class="{ connected: isConnected }">
        {{ isConnected ? "연결됨" : "연결 중..." }}
      </div>
    </div>

    <div class="chat-messages">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="message"
        :class="{ 'own-message': isOwnMessage(msg.username) }"
      >
        <div class="message-header">
          <span class="username">{{ msg.username }}</span>
          <span class="time" v-if="msg.timestamp">{{
            getMessageTime(msg.timestamp)
          }}</span>
          <span class="time" v-else>{{ getMessageTime() }}</span>
        </div>
        <div class="message-content">{{ msg.message }}</div>
      </div>
    </div>

    <div class="message-input">
      <input
        v-model="newMessage"
        @keyup.enter="sendMessage"
        placeholder="메시지를 입력하세요..."
        :disabled="!isConnected"
      />
      <button @click="sendMessage" :disabled="!isConnected">전송</button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import socketService from "../utils/socket";
import axios from "axios";
import { ChatMessage } from "../types/ChatTypes";

// Props 정의
const props = defineProps<{
  room: string;
  username: string;
}>();

// 메시지 목록과 입력 메시지 상태
const messages = ref<ChatMessage[]>([]);
const newMessage = ref("");
const isConnected = ref(false);

// 메시지 전송 처리
const sendMessage = () => {
  if (newMessage.value.trim() === "") return;

  const chatMessage: ChatMessage = {
    username: props.username,
    message: newMessage.value,
    room: props.room,
  };

  socketService.sendMessage(chatMessage);
  newMessage.value = "";
};

onMounted(async () => {
  console.log("컴포넌트 마운트, Room ID:", props.room);
  console.log("초기 연결 상태:", socketService.isConnected());
  const res = await axios.get(`/api/chat/history?room=${props.room}`);
  console.log(res.data);
  messages.value.push(...res.data);
  console.log("메세지 푸쉬됨");
  console.log(messages.value);

  // 소켓 연결
  socketService.connect();

  // 1초 후 연결 상태 확인 (디버깅용)
  setTimeout(async () => {
    console.log("1초 후 연결 상태:", socketService.isConnected());

    // 여전히 연결이 안 된 경우 재연결 시도
    if (!socketService.isConnected()) {
      console.log("연결이 안 되어 있어 재연결 시도");
      socketService.connect();
    }
  }, 1000);

  // 연결 성공 핸들러
  socketService.onConnect(() => {
    console.log("연결 성공 콜백!");
    isConnected.value = true;

    // Room ID 확인 및 방 입장
    if (props.room) {
      console.log(`방 입장 시도: ${props.room}`);
      socketService.joinRoom(props.room);
    } else {
      console.error("유효하지 않은 Room ID");
    }
  });

  // 연결 해제 핸들러
  socketService.onDisconnect(() => {
    console.log("연결 해제 콜백!");
    isConnected.value = false;
  });

  // 메시지 수신 핸들러
  socketService.onReceiveMessage((message: ChatMessage) => {
    console.log("메시지 수신:", message);
    messages.value.push(message);

    // 채팅창 스크롤 조정
    setTimeout(() => {
      const chatContainer = document.querySelector(".chat-messages");
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 50);
  });
});

// 컴포넌트 언마운트 시 정리
onUnmounted(() => {
  console.log("컴포넌트 언마운트, 리스너 제거");
  socketService.removeAllListeners();
  socketService.disconnect();
});

// 메시지 시간 포맷팅
const getMessageTime = (msg?: string) => {
  const date = msg ? new Date(msg) : new Date();

  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

// 사용자 본인의 메시지 여부 확인
const isOwnMessage = (messageUsername: string) => {
  return messageUsername === props.username;
};
</script>

<script lang="ts">
export default {
  name: "ChatRoom",
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 60%;
  width: 80%;
  margin: 0 auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.chat-header {
  background-color: #f0f0f0;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
}

.chat-header h2 {
  margin: 0;
  font-size: 16px;
}

.connection-status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 20px;
  background-color: #ffcccc;
}

.connection-status.connected {
  background-color: #ccffcc;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message {
  max-width: 75%;
  padding: 10px;
  border-radius: 8px;
  background-color: #f1f1f1;
  align-self: flex-start;
}

.own-message {
  background-color: #dcf8c6;
  align-self: flex-end;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 12px;
}

.username {
  font-weight: bold;
  margin-right: 10px;
}

.time {
  color: #888;
}

.message-content {
  word-break: break-word;
}

.message-input {
  display: flex;
  border-top: 1px solid #ddd;
  padding: 10px;
}

.message-input input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
}

.message-input button {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.message-input button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
