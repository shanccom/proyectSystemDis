package com.voting.voting.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI votingApi() {

        return new OpenAPI()
                .info(
                        new Info()
                                .title("Voting Service API")
                                .description("Microservice responsible for vote registration and election results.")
                                .version("1.0.0")
                                .contact(
                                        new Contact()
                                                .name("Voting Team")
                                                .email("team@voting.com")
                                )
                );
    }

}