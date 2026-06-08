package com.voting.voting;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class VotingServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(VotingServiceApplication.class, args);
	}

	@GetMapping("/health")
	public String health() {
		return "Voting Service is running";
	}
}
