<template>
  <RegisterFormComponent :fields="emptyFields" :apiURL="'/api/auth/register'" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const emptyFields = ref({
  username: "",
  name: "",
  email: "",
  password: "",
  phone: "",
  profileImage: "",
  address: {
    country: "",
    mainAddress: "",
    subAddress: "",
  },
});
</script>
