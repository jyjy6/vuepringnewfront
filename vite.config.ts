import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";

export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],
  server: {
    host: "0.0.0.0", // 모든 네트워크에서 접근 가능하도록 설정
    port: 5173, // 포트 설정
    strictPort: true, // 포트 충돌 방지
  },
});
