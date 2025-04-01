import axios, { AxiosError } from "axios";
import { useLoginStore } from "../store/loginStore";

const baseURL = import.meta.env.VITE_API_BASE_URL || "";
const withCredentials = true;

// 📌 인터셉터 등록 여부 체크

const accessToken = localStorage.getItem("accessToken");

const refreshAccessToken = async () => {
  console.log("refreshAccessToken: Function invoked");

  try {
    // 서버에 요청하여 새로운 액세스 토큰 발급
    const response = await axios.get(`${baseURL}/refresh-token`);

    const { accessToken } = response.data;
    console.log("새로운 액세스 토큰:", accessToken);

    // 로컬스토리지에 액세스 토큰 저장
    localStorage.setItem("accessToken", accessToken);
    console.log("Access token saved to localStorage");

    return accessToken;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error refreshing access token:", error);
      // 리프레시 토큰 만료 또는 기타 이유로 401 발생 시 로그아웃 처리
      if (error.response && error.response.status === 401) {
        alert("토큰이 만료되었습니다. 다시 로그인해주세요.");
        const loginStore = useLoginStore();
        loginStore.logout();
        window.location.href = "/login";
      }
      throw new Error("Failed to refresh access token");
    }
  }
};

// 회원일경우에만 인터셉터 발동
if (accessToken) {
  axios.interceptors.request.use(
    async (config) => {
      console.log("Axios Request Interceptor - Start");
      config.headers["Authorization"] = `Bearer ${accessToken}`;
      console.log(
        "Authorization Header Added:",
        config.headers["Authorization"]
      );

      console.log("Axios Request Interceptor - End");
      return config;
    },
    (error) => {
      console.error("Request interceptor error:", error);
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터
  axios.interceptors.response.use(
    (response) => {
      console.log("Axios Response Interceptor - Success");
      return response;
    },
    async (error) => {
      console.log("Axios Response Interceptor - Error");
      const originalRequest = error.config;

      // /api/auth/login, /refresh-token 요청이면 인터셉터 적용 안 함
      if (
        originalRequest.url === "/api/login/jwt" ||
        originalRequest.url.includes("/refresh-token")
      ) {
        console.log("Login request, skipping interceptor");
        return Promise.reject(error);
      }

      // 401 Unauthorized 응답 처리 (토큰 만료 시)
      if (
        error.response &&
        error.response.status === 401 &&
        !originalRequest._retry
      ) {
        console.log("401 Unauthorized, attempting token refresh");
        originalRequest._retry = true; // 재시도 플래그 설정

        try {
          // 새로운 액세스 토큰 발급
          console.log("액세스토큰 발급");
          const newAccessToken = await refreshAccessToken();
          console.log("New access token acquired:", newAccessToken);

          // 원래 요청에 새로운 액세스 토큰 추가
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

          console.log("액세스토큰 발급완료");
          // 원래 요청 재시도
          return axios(originalRequest);
        } catch (refreshError) {
          console.error("Failed to refresh access token:", refreshError);
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
}

axios.defaults.baseURL = baseURL;
axios.defaults.withCredentials = withCredentials;

export default {
  install: (app: any) => {
    // 필요하다면 app에 axios 인스턴스를 주입할 수 있습니다.
    app.config.globalProperties.$axios = axios;
  },
};
