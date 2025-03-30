// composables/useSecureApi.ts
import axios, { AxiosError } from "axios";
import { ref } from "vue";

export const useSecureApi = () => {
  const csrfToken = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<AxiosError | null>(null);

  const getCsrfTokenFromCookie = () => {
    console.log("All cookies:", document.cookie);
    const match = document.cookie.match(/(^| )XSRF-TOKEN=([^;]+)/);
    return match ? match[2] : null;
  };

  // CSRF 토큰 가져오기
  const fetchCsrfToken = async () => {
    if (csrfToken.value) return csrfToken.value;

    const tokenFromCookie = getCsrfTokenFromCookie(); // 쿠키에서 가져오기
    if (tokenFromCookie) {
      csrfToken.value = tokenFromCookie;
      return csrfToken.value;
    }

    isLoading.value = true;
    error.value = null;
    try {
      await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/csrf`, {
        withCredentials: true,
      });
      console.log("api/auth/csrf발동");
      // 쿠키에서 다시 토큰 추출
      const refreshedTokenFromCookie = getCsrfTokenFromCookie();
      if (refreshedTokenFromCookie) {
        csrfToken.value = refreshedTokenFromCookie;
        return csrfToken.value;
      }
    } catch (err) {
      console.error("CSRF 토큰을 가져오는 데 실패했습니다:", err);
      return null;
    }
  };

  // 보안 POST 요청
  const securePost = async (url: string, data: any) => {
    const token = await fetchCsrfToken();

    console.log("마지막토큰:" + token);
    return axios.post(url, data, {
      headers: {
        "X-XSRF-TOKEN": token,
      },

      withCredentials: true,
    });
  };

  // 보안 PUT 요청
  const securePut = async (url: string, data: any) => {
    console.log("보안PUT요청발동");
    const token = await fetchCsrfToken();
    return axios.put(url, data, {
      headers: {
        "X-XSRF-TOKEN": token,
      },
    });
  };

  // 보안 DELETE 요청
  const secureDelete = async (url: string) => {
    console.log("보안delete요청발동");
    const token = await fetchCsrfToken();
    return axios.delete(url, {
      headers: {
        "X-XSRF-TOKEN": token,
      },
    });
  };

  return {
    fetchCsrfToken,
    securePost,
    securePut,
    secureDelete,
    isLoading,
    error,
  };
};
