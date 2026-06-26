# Build stage
FROM amazoncorretto:17-alpine AS builder

WORKDIR /workspace

# Copy Gradle files first; deps cache benefits from layering
COPY gradle/ gradle/
COPY gradlew settings.gradle build.gradle ./
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon

# Now copy source and build
COPY src/ src/
RUN ./gradlew bootJar --no-daemon -x test

# Runtime stage
FROM amazoncorretto:17-alpine

WORKDIR /app

# Add a non-root user for the runtime
RUN addgroup -S spring && adduser -S spring -G spring
USER spring

COPY --from=builder /workspace/build/libs/*.jar /app/api.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/api.jar"]