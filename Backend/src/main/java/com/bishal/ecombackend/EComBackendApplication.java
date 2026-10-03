package com.bishal.ecombackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@SpringBootApplication
public class EComBackendApplication {

    public static void main(String[] args) {
        loadDotenv();
        SpringApplication.run(EComBackendApplication.class, args);
    }

    private static void loadDotenv() {
        // Look for .env in current directory or parent directory
        Path envPath = Paths.get(".env");
        if (!Files.exists(envPath)) {
            envPath = Paths.get("..", ".env");
        }

        if (Files.exists(envPath)) {
            try {
                Files.readAllLines(envPath).stream()
                        .map(String::trim)
                        .filter(line -> !line.isEmpty() && !line.startsWith("#") && line.contains("="))
                        .forEach(line -> {
                            int splitIdx = line.indexOf('=');
                            String key = line.substring(0, splitIdx).trim();
                            String value = line.substring(splitIdx + 1).trim();

                            // Strip surrounding single/double quotes if present
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                    (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }

                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                        });
            } catch (IOException ignored) {
            }
        }
    }
}