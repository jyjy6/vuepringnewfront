# 1단계: 빌드 스테이지
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN ["npm", "ci"]

COPY . .
RUN npm run build

# 2단계: Nginx를 이용한 정적 파일 서빙 (커스텀 conf 적용)
FROM nginx:stable-alpine
# 커스텀 Nginx 설정 파일을 복사 (기존 default.conf 대체)
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]