package com.example.lbf;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import jakarta.annotation.PostConstruct;

@SpringBootApplication
public class LbfApplication {

	@PostConstruct
	public void init() {
		TimeZone.setDefault(TimeZone.getTimeZone("America/Mexico_City"));
		System.out.println("Zona horaria configurada a: " + TimeZone.getDefault());
	}

	public static void main(String[] args) {
		SpringApplication.run(LbfApplication.class, args);
	}

}
