FROM node:18-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Establecer variable de entorno para la URL de la API
ENV VITE_API_URL=http://localhost:8080

# Construir la aplicación
RUN npm run build

# Etapa de producción usando Nginx
FROM nginx:alpine

# Copiar configuración de Nginx personalizada
COPY --from=build /app/dist /usr/share/nginx/html

# Agregar configuración de Nginx para SPA (Single Page Application)
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
