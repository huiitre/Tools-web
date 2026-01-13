# --- Build stage -------------------------------------------------
FROM node:18 AS build

WORKDIR /app

ARG VITE_MODE=production

# On déclare les variables que Vite doit connaître
ARG VITE_TOOLS_API_BASE_URL
ARG VITE_GOOGLE_CLIENT_ID_WEB
ARG VITE_GOOGLE_CLIENT_ID_ANDROID
ARG VITE_GOOGLE_API_KEY

# On expose les variables en ENV pour que Vite puisse les lire
ENV VITE_TOOLS_API_BASE_URL=${VITE_TOOLS_API_BASE_URL}
ENV VITE_GOOGLE_CLIENT_ID_WEB=${VITE_GOOGLE_CLIENT_ID_WEB}
ENV VITE_GOOGLE_CLIENT_ID_ANDROID=${VITE_GOOGLE_CLIENT_ID_ANDROID}
ENV VITE_GOOGLE_API_KEY=${VITE_GOOGLE_API_KEY}

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --mode ${VITE_MODE}

# --- Runtime stage ------------------------------------------------
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
