# --- Build stage -------------------------------------------------
FROM node:18 AS build

WORKDIR /app

# On déclare les variables que Vite doit connaître
ARG VITE_TOOLS_API_URL_V1
ARG VITE_TOOLS_API_URL_V2
ARG VITE_TOOLS_BACKEND_URL
ARG VITE_GOOGLE_CLIENT_ID_WEB
ARG VITE_GOOGLE_CLIENT_ID_ANDROID
ARG VITE_GOOGLE_API_KEY

# On expose les variables en ENV pour que Vite puisse les lire
ENV VITE_TOOLS_API_URL_V1=${VITE_TOOLS_API_URL_V1}
ENV VITE_TOOLS_API_URL_V2=${VITE_TOOLS_API_URL_V2}
ENV VITE_TOOLS_BACKEND_URL=${VITE_TOOLS_BACKEND_URL}
ENV VITE_GOOGLE_CLIENT_ID_WEB=${VITE_GOOGLE_CLIENT_ID_WEB}
ENV VITE_GOOGLE_CLIENT_ID_ANDROID=${VITE_GOOGLE_CLIENT_ID_ANDROID}
ENV VITE_GOOGLE_API_KEY=${VITE_GOOGLE_API_KEY}

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --mode qa

# --- Runtime stage ------------------------------------------------
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
