# Etapa 1: Construcción del JAR
FROM maven:3.8.6 AS builder
WORKDIR /app
# Instala OpenJDK 19 manualmente
RUN apt-get update && apt-get install -y openjdk-19-jdk && rm -rf /var/lib/apt/lists/*
ENV JAVA_HOME=/usr/lib/jvm/java-19-openjdk-amd64
# Copia el archivo pom.xml y descarga las dependencias
COPY pom.xml .
RUN mvn dependency:go-offline
# Copia el resto del código fuente
COPY src ./src
# Compila el proyecto y genera el JAR
RUN mvn clean package -DskipTests

# Etapa 2: Ejecución del JAR en OpenJDK 19
FROM openjdk:19-jdk
WORKDIR /app
# Copia el archivo JAR generado desde la etapa anterior
COPY --from=builder /app/target/lbf-1.0.0.jar app_lbf.jar
# Expone el puerto 8080 (puerto predeterminado de Spring Boot)
EXPOSE 8080
# Ejecuta el archivo JAR
ENTRYPOINT ["java", "-jar", "app_lbf.jar"]