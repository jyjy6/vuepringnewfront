<template>
  정보수정
  <RegisterFormComponent
    :formData="formData"
    apiURL="/api/members/modify"
    :isPut="true"
  />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

import { UserInfo } from "../../types/UserInfoTypes";
import RegisterFormComponent from "../../components/RegisterFormComponent.vue";
import { useLoginStore } from "../../store/loginStore";

const loginStore = useLoginStore();

const formData = ref<Partial<UserInfo>>({
  email: "",
  displayName: "",
  phone: "",
  updatedAt: "",
  profileImage: "",
  country: "",
  mainAddress: "",
  subAddress: "",
});

onMounted(() => {
  // loginStore에서 user 정보를 가져와 formData에 할당
  if (loginStore.user) {
    formData.value = {
      username: loginStore.user.username,
      email: loginStore.user.email,
      displayName: loginStore.user.displayName,
      phone: loginStore.user.phone,
      role: loginStore.user.role,
      profileImage: loginStore.user.profileImage,
      country: loginStore.user.country,
      mainAddress: loginStore.user.mainAddress,
      subAddress: loginStore.user.subAddress,
    };
  }
  console.log(formData.value);
});
</script>
