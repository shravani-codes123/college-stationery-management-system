package com.college.stationery.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF
            .cors(cors -> {}) // 👈 Enable CORS to work with WebConfig
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/**").permitAll() // 👈 UNLOCKED: Allow all dashboard APIs
                .anyRequest().authenticated()
            );
        return http.build();
    }
}
