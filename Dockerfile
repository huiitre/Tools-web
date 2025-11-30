# --- Build stage -------------------------------------------------
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --- Runtime stage ------------------------------------------------
FROM nginx:alpine

# Supprime la config par défaut
RUN rm -rf /usr/share/nginx/html/*

# Copie le build de Vite
COPY --from=build /app/dist /usr/share/nginx/html

# Copie d'une config nginx personnalisée (optionnelle)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
