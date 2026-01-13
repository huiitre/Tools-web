# --- Build stage -------------------------------------------------
FROM node:18 AS build

WORKDIR /app

ARG VITE_MODE=production

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
