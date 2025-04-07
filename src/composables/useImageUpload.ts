import axios from "axios";
import { ref } from "vue";
import { useLoginStore } from "../store/loginStore";

export function useImageUpload() {
  const singleImgUrl = ref("");
  //개별이미지 업로드 용 ref

  const handleFileUpload = async (event: Event, form?: string[]) => {
    const input = event.target as HTMLInputElement;
    const loginStore = useLoginStore();
    const userRole = loginStore.getUser?.role || "USER";
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);

      for (const file of files) {
        const fileName = file.name;
        try {
          const response = await axios.get(
            `${
              import.meta.env.VITE_API_BASE_URL
            }/api/images/presigned-url?filename=${fileName}&role=${userRole}`
          );
          const presignedUrl = response.data.presignedUrl;
          const imageUrl: string = response.data.imageUrl;

          console.log(presignedUrl);
          const uploadResult = await fetch(presignedUrl, {
            method: "PUT",
            body: file,
          });

          if (uploadResult.status === 200) {
            form?.push(imageUrl);
            singleImgUrl.value = imageUrl;
            console.log("File uploaded successfully:", imageUrl);
          } else {
            console.error("File upload failed:", uploadResult.statusText);
          }
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            console.error(
              "Upload error:",
              error.response.status,
              error.response.statusText
            );
            console.error("Error data:", error.response.data);
          } else {
            console.error("Upload error:", error);
          }
        }
      }
    }
  };

  return {
    handleFileUpload,
    singleImgUrl,
  };
}
