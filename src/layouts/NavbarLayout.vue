<template>
  <v-app-bar v-if="!isScrolled" height="150" style="padding: 0 3vw">
    <!-- 로고 (왼쪽에 배치) -->
    <div
      class="d-flex align-center ml-10"
      style="flex: 1; justify-content: flex-start"
    >
      <v-img
        src="https://ringmagazine.com/assets/ring-tv-assets/images/logo/logo.svg"
        alt="Logo"
        class="cursor-pointer"
        max-width="300"
        height="100"
        contain
        @click="$router.push('/')"
      />
    </div>

    <!-- 웹사이트 타이틀 (중앙에 배치) -->
    <div class="d-flex align-center" style="flex: 1; justify-content: center">
      <span style="font-size: 2vw; font-weight: bold">
        THE BIBLE OF BOXING
      </span>
    </div>

    <!-- 버튼들 (오른쪽에 배치) -->
    <div
      class="d-flex align-center"
      style="flex: 1; justify-content: flex-end; gap: 10px"
    >
      <v-btn @click="$router.push('/news')" color="secondary" variant="outlined"
        >언어선택</v-btn
      >
      <v-btn variant="outlined" @click="$router.push('/p4p')" color="error"
        >SUBSCRIBE</v-btn
      >
      <v-btn
        v-if="!loginStore.isLogin"
        variant="outlined"
        @click="$router.push('/login')"
        color="info"
        >로그인</v-btn
      >
      <v-btn
        v-else
        variant="outlined"
        @click="loginStore.logout()"
        color="warning"
        >로그아웃</v-btn
      >
    </div>
  </v-app-bar>

  <v-app-bar
    :class="['custom-navbar', { 'navbar-scrolled': isScrolled }]"
    flat
    height="70"
  >
    <v-container fluid class="px-6">
      <div class="d-flex align-center justify-space-between">
        <!-- Logo Section -->
        <v-app-bar-title @click="$router.push('/')">
          <img
            src="https://ringmagazine.com/assets/ring-tv-assets/images/logo/logo.svg"
            alt="Logo"
            class="cursor-pointer"
            :style="{ display: isScrolled ? 'block' : 'none' }"
            height="40"
            width="120"
            contain
          />
        </v-app-bar-title>

        <!-- Desktop Navigation -->
        <div class="desktop-nav hidden-sm-and-down">
          <v-btn
            v-for="item in menuItems"
            :key="item.title"
            text
            class="nav-btn mx-2"
            @click="handleNavigation(item)"
          >
            {{ item.title }}
          </v-btn>
        </div>

        <!-- Mobile Menu Toggle -->
        <div class="mobile-menu hidden-md-and-up">
          <v-btn icon @click.stop="drawer = !drawer" class="menu-toggle">
            <v-icon>mdi-menu</v-icon>
          </v-btn>
        </div>
      </div>
    </v-container>
  </v-app-bar>

  <!-- Mobile Drawer -->
  <v-navigation-drawer
    v-model="drawer"
    app
    temporary
    right
    class="mobile-drawer"
  >
    <v-list>
      <v-list-item
        v-for="(item, index) in menuItems"
        :key="index"
        @click="handleNavigation(item)"
        class="mobile-nav-item"
      >
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

  <!-- Divisions Modal -->
  <v-dialog v-model="divisionsModal" max-width="500">
    <v-card class="divisions-modal">
      <v-card-title class="text-h6 font-weight-bold text-center">
        Boxing Divisions
      </v-card-title>
      <v-card-text>
        <!-- Divisions content -->
        <v-row style="gap: 1px">
          <v-col
            cols="12"
            style="padding: 5px"
            v-for="division in boxingDivisions"
            :key="division"
          >
            <router-link
              :to="`/${formatDivision(division)}`"
              class="text-decoration-none"
              @click="divisionsModal = false"
            >
              <v-chip
                class="text-center division-chip d-flex justify-center align-center"
                label
                outlined
                color="primary"
              >
                {{ division }}
              </v-chip>
            </router-link>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useLoginStore } from "../store/loginStore";

const loginStore = useLoginStore();
const router = useRouter();
const drawer = ref(false);
const isScrolled = ref(false);
const divisionsModal = ref(false);
const boxingDivisions = [
  "Heavy",
  "Cruiser",
  "Light Heavy",
  "Super Middle",
  "Middle",
  "Super Welter",
  "Welter",
  "Super Light",
  "Light",
  "Super Feather",
  "Feather",
  "Super Bantam",
  "Bantam",
  "Super Fly",
  "Fly",
  "Light Fly",
];
const formatDivision = (division) => {
  return division.toLowerCase().replace(/\s+/g, "");
};

const menuItems = [
  { title: "NEWS", route: "/news" },
  { title: "P4P RANKINGS", route: "/p4p" },
  { title: "DIVISIONS", route: "modal" },
  { title: "SCHEDULE", route: "/schedule" },
  { title: "ADMIN", route: "/admin" },
  { title: "SHOP", route: "/shop" },
  { title: "CONTACT", route: "/contact" },
];

const handleNavigation = (item) => {
  if (item.route === "modal") {
    divisionsModal.value = true;
  } else {
    router.push(item.route);
  }
  drawer.value = false;
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
.custom-navbar {
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.navbar-scrolled {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.nav-btn {
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #333;
  transition: color 0.3s ease;
}

.nav-btn:hover {
  color: #007bff;
}

.logo-container {
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.logo-container:hover {
  opacity: 1;
}

.mobile-drawer {
  background-color: rgba(255, 255, 255, 0.95);
}

.mobile-nav-item {
  text-transform: uppercase;
  font-weight: 500;
}

.divisions-modal .v-chip {
  transition: all 0.3s ease;
}

.divisions-modal .v-chip:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.division-chip {
  width: 100%;
}
</style>
