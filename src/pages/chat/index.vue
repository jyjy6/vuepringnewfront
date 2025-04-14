<script setup lang="ts">
import { ref } from "vue";
import ChatRoomComponent from "../../components/ChatRoomComponent.vue";
import { useLoginStore } from "../../store/loginStore";

const loginStore = useLoginStore();
const username = loginStore.getUser!.username as string;
const room = loginStore.getUser?.id?.toString() || Date.now().toString(); // 현재 시간을 밀리초로, 거의 유일함
const showChat = ref(false);

const enterChat = () => {
  if (username?.trim() !== "" && room !== null) {
    showChat.value = true;
  }
};
</script>

<template>
  <div class="app">
    <div v-if="!showChat" class="login-container">
      <h1>문의하기</h1>
      <div class="form-group">
        <label for="username">사용자 이름:</label>
        <input id="username" v-model="username" />
      </div>
      <!-- 이건 display:none같은거 해두는데 개발상태라 그냥 확인용으로 냅둠 -->
      <div class="form-group">
        <label for="room">방 ID:</label>
        <input id="room" v-model="room" />
      </div>
      <button @click="enterChat">입장하기</button>
    </div>

    <ChatRoomComponent v-else :username="username" :room="room" />
  </div>
</template>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.login-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 300px;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}
</style>
