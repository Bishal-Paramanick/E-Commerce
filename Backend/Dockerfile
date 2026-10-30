# ==========================================
# Stage 1: Build
# ==========================================
FROM amazoncorretto:25-jdk AS builder

LABEL authors="Bishal"

WORKDIR /build

# findutils provides xargs, which gradlew requires
RUN dnf install -y findutils && dnf clean all

# Longer network timeouts for slow connections
ENV GRADLE_OPTS="-Dorg.gradle.internal.http.connectionTimeout=120000 -Dorg.gradle.internal.http.socketTimeout=120000"

COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle gradle.properties ./

# Fix Windows line endings, make executable, raise wrapper download timeout (default is 10s)
RUN sed -i 's/\r$//' gradlew \
    && chmod +x gradlew \
    && sed -i 's/^networkTimeout=.*/networkTimeout=120000/' gradle/wrapper/gradle-wrapper.properties

# Download the Gradle distribution (cached layer). Retries 3 times, fails the build if all fail.
RUN for i in 1 2 3; do ./gradlew --version --no-daemon && exit 0; echo "Retry $i..."; sleep 5; done; exit 1

# Download project dependencies (cached layer)
RUN ./gradlew dependencies --no-daemon > /dev/null

COPY src src

RUN ./gradlew bootJar -x test --no-daemon

# ==========================================
# Stage 2: Runtime
# ==========================================
FROM amazoncorretto:25

LABEL authors="Bishal"

WORKDIR /app

RUN dnf install -y shadow-utils \
    && useradd -u 1001 -U -s /bin/sh appuser \
    && mkdir -p /app/logs \
    && chown -R 1001:1001 /app \
    && dnf clean all \
    && rm -rf /var/cache/dnf

# Ensure your jar matches build/libs (using wildcard *.jar is safest)
COPY --from=builder --chown=1001:1001 /build/build/libs/*.jar app.jar

USER 1001:1001

EXPOSE 8080

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-XX:+UseG1GC", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]