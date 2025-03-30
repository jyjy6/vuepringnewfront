<template>
  회원가입
  <RegisterFormComponent
    :fields="emptyFields"
    :apiURL="'/api/members/register'"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { UserInfo } from "../types/UserInfoTypes";
import RegisterFormComponent from "../components/RegisterFormComponent.vue";

const emptyFields = ref<UserInfo>({
  username: "",
  password: "",
  email: "",
  displayName: "",
  phone: "",
  createdAt: "",
  updatedAt: "",
  role: "",
});
</script>
