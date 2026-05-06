package AppDev.CampusMarketplace;

import AppDev.CampusMarketplace.Security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/test").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/cloudinary/sign").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/seller-applications", "/api/seller/apply")
                    .hasRole("CUSTOMER")
                .requestMatchers("/api/seller-applications/pending", "/api/seller-applications/*/approve")
                    .hasAnyRole("ADMIN", "SUPERADMIN")
                .requestMatchers("/api/seller/store", "/api/seller/dashboard")
                    .hasAnyRole("SELLER", "ADMIN", "SUPERADMIN")
                .requestMatchers("/api/seller/**").hasRole("SELLER")
                .requestMatchers("/api/admin/promote/**").hasRole("SUPERADMIN")
                .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "SUPERADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
