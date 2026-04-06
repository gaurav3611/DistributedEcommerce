package com.ecomm.distributed.ignite;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        System.setProperty("IGNITE_QUIET", "false");
        SpringApplication.run(Application.class, args);
    }
}
