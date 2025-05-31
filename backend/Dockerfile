FROM maven:3.9-eclipse-temurin-19-alpine AS build

WORKDIR /app

# Copiar solo los archivos de dependencias primero para aprovechar la caché de Docker
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Descargar dependencias (se almacenarán en caché si no hay cambios en pom.xml)
RUN mvn dependency:go-offline -B

# Copiar el código fuente
COPY src src

# Construir la aplicación
RUN mvn package -DskipTests

# Etapa de ejecución
FROM eclipse-temurin:19-jre-alpine

WORKDIR /app

# Copiar el JAR desde la etapa de compilación
COPY --from=build /app/target/*.jar app.jar

# Variables de entorno (se pueden sobrescribir al ejecutar el contenedor)
ENV DB_URL=jdbc:postgresql://db:5432/bpv
ENV DB_USER_NAME=postgres
ENV DB_PASSWORD=postgres

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
