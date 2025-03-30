import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import axios, { AxiosError } from "axios";
import { UserInfo } from "../types/UserInfoTypes";
import { useSecureApi } from "../composables/useSecureApi";
import { jwtDecode } from "jwt-decode";

export const useLoginStore = defineStore("login", () => {
  const isLogin = ref(false);
  const user = ref<UserInfo | null>();
  const router = useRouter();
  const api = useSecureApi();

  // ✅ 앱이 실행될 때 로컬 스토리지에서 유저 정보 불러오기
  const loadUserFromLocalStorage = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      user.value = JSON.parse(storedUser);
      isLogin.value = true; // 로그인 상태 유지
    }
  };

  const login = async (
    username: string,
    password: string
  ): Promise<boolean | undefined> => {
    try {
      const response = await api.securePost(
        `${import.meta.env.VITE_API_BASE_URL}/login/jwt`,
        { username, password }
      );

      if (response.data) {
        const accessToken = response.data.accessToken;

        // ✅ JWT 디코딩해서 유저 정보 추출
        const decodedToken: any = jwtDecode(accessToken);
        console.log("Decoded Token:", decodedToken);
        if (decodedToken.userInfo) {
          user.value = JSON.parse(decodedToken.userInfo); // 🔥 userInfo가 JSON으로 들어있음
        }

        isLogin.value = true;

        // ✅ 로컬 스토리지에 저장 (새로고침 시 유지)
        localStorage.setItem("user", JSON.stringify(user.value));
        localStorage.setItem("accessToken", accessToken);

        alert("로그인 성공!");
        router.push("/").then(() => window.location.reload());
      } else {
        alert(response.data.message || "로그인 실패!");
      }
      return;
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(error.response.data.message);
      } else {
        alert("로그인 중 오류가 발생했습니다.");
      }
    }
  };

  const logout = async () => {
    try {
      // 1. 쿠키 삭제 (HTTP Only 쿠키는 서버 도움 필요->refreshToken은 서버에서 처리하나, 여기선 학습용으로 명시적으로써놓음)
      document.cookie =
        "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // 2. 로컬 스토리지 정리
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");

      // 3. 상태 업데이트
      user.value = null;
      isLogin.value = false;

      // 4. 서버에 로그아웃 알림 (HTTP Only 쿠키(refreshToken) 삭제를 위해)
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/logout`);

      // 5. 로그인 페이지로 리다이렉트
      router.push("/login");

      return true;
    } catch (error) {
      console.error("로그아웃 중 오류:", error);
      return false;
    }
  };

  // ✅ 컴포넌트에서 `user?.username` 이런 방식으로 쉽게 접근 가능하도록 Getter 제공
  const isAuthenticated = computed(() => isLogin.value);
  const getUser = computed(() => user.value);

  return {
    isLogin,
    user,
    isAuthenticated,
    getUser,
    login,
    logout,
    loadUserFromLocalStorage,
  };
});
