FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY fintrack-domain/pom.xml fintrack-domain/
COPY fintrack-application/pom.xml fintrack-application/
COPY fintrack-infrastructure/pom.xml fintrack-infrastructure/
RUN mvn -q -B dependency:go-offline
COPY . .
RUN mvn -q -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system fintrack
USER fintrack
COPY --from=build /app/fintrack-infrastructure/target/fintrack-backend.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
