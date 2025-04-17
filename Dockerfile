# 1단계: 빌드 스테이지
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN ["npm", "ci"]

COPY . .
RUN npm run build

# 2단계: Nginx를 이용한 정적 파일 서빙 (커스텀 conf 적용)
FROM nginx:stable-alpine

# rate limit 설정을 메인 nginx.conf에 추가
RUN sed -i '/http {/a \    limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;' /etc/nginx/nginx.conf

# 커스텀 Nginx 설정 파일을 복사 (기존 default.conf 대체)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# SSL 디렉토리 생성 및 인증서 복사
RUN mkdir -p /etc/nginx/ssl
COPY localhost+2.pem /etc/nginx/ssl/nginx-selfsigned.crt
COPY localhost+2-key.pem /etc/nginx/ssl/nginx-selfsigned.key
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]