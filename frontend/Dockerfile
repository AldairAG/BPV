# Etapa 1: Construcción del frontend
FROM node:18-alpine AS builder
WORKDIR /app
# Copia los archivos de configuración de Node.js
COPY package.json package-lock.json ./
RUN npm install
# Copia el resto del código fuente
COPY . .
# Construye el proyecto frontend
RUN npm run build

# Muestra el contenido del directorio src para depurar
RUN ls -l src
RUN ls -l src/constants
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine
# Copia el archivo de configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copia los archivos generados por el frontend
COPY --from=builder /app/dist /usr/share/nginx/html
# Expone el puerto 80
EXPOSE 80
# Inicia Nginx
CMD ["nginx", "-g", "daemon off;"]

