import axios, { AxiosError } from "axios";
import { useLoginStore } from "../store/loginStore";

const baseURL = import.meta.env.VITE_API_BASE_URL || "";
const withCredentials = true;

// 📌 인터셉터 등록 여부 체크

const accessToken = localStorage.getItem("accessToken");
const loginCheck = localStorage.getItem("user");

// 액세스토큰 갱신 함수
const refreshAccessToken = async () => {
  console.log("refreshAccessToken: Function invoked");

  try {
    // 서버에 요청하여 새로운 액세스 토큰 발급
    const response = await axios.get(`${baseURL}/api/refresh-token`, {
      withCredentials: true,
    });

    const { accessToken } = response.data;
    console.log("새로운 액세스 토큰:", accessToken);

    // 로컬스토리지에 액세스 토큰 저장
    localStorage.setItem("accessToken", accessToken);
    console.log("Access token saved to localStorage");

    return accessToken;
  } catch (error) {
    console.log(error);
  }
};
// 토큰 갱신 상태 관리
let isRefreshing = false;
let failedRequests = [];

// 회원일경우에만 인터셉터 발동
if (loginCheck) {
  axios.interceptors.request.use(
    async (config) => {
      const ignoreInterceptor = ["/api/logout"];
      if (ignoreInterceptor.some((url) => config.url?.includes(url))) {
        return config;
      }

      if (!accessToken) {
        // 토큰이 없으면 요청을 중단하고 로그아웃 처리
        if (!isRefreshing) {
          isRefreshing = true;
          const loginStore = useLoginStore();
          loginStore.logout();
          alert("토큰이 만료되었습니다. 다시 로그인해주세요.");
          window.location.href = "/login";
          return Promise.reject(new Error("로그인하셈"));
        }
      }

      console.log("Axios Request Interceptor - Start");
      const currentAccessToken = localStorage.getItem("accessToken");
      if (currentAccessToken) {
        config.headers["Authorization"] = `Bearer ${currentAccessToken}`;
      }
      console.log(
        "Authorization Header Added:",
        config.headers["Authorization"]
      );
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
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // 로그인 요청은 무시
      if (originalRequest.url.includes("/api/login/jwt")) {
        return Promise.reject(error);
      }

      // 토큰 갱신 요청에서 401 에러가 발생했다면 바로 로그아웃
      if (
        originalRequest.url.includes("/api/refresh-token") &&
        error.response?.status === 401
      ) {
        if (!isRefreshing) {
          isRefreshing = true;
          const loginStore = useLoginStore();
          loginStore.logout();
          alert("토큰이 만료되었습니다. 다시 로그인해주세요.");
          window.location.href = "/login";
          return Promise.reject(error);
        }
      }

      // 401 Unauthorized 응답 처리 (토큰 만료 시)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // 토큰 갱신 중이 아닐 때만 갱신 시도
        if (!isRefreshing) {
          isRefreshing = true;

          try {
            const newAccessToken = await refreshAccessToken();

            // 갱신 성공 - 대기 중인 요청들 처리
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;
            isRefreshing = false;
            return axios(originalRequest);
          } catch (refreshError) {
            isRefreshing = false;
            return Promise.reject(refreshError);
          }
        } else {
          // 이미 갱신 중이면 원래 요청을 큐에 추가
          return new Promise((resolve, reject) => {
            failedRequests.push({ resolve, reject });
          });
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
    app.config.globalProperties.$axios = axios;
  },
};
