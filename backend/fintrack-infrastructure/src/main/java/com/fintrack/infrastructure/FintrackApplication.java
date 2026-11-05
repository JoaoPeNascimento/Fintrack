package com.fintrack.infrastructure;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class FintrackApplication {

    public static void main(String[] args) {
        SpringApplication.run(FintrackApplication.class, args);
    }
}
