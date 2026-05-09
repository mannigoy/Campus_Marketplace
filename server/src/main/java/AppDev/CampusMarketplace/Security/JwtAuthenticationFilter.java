package AppDev.CampusMarketplace.Security;

import AppDev.CampusMarketplace.Entity.Role;
import AppDev.CampusMarketplace.Entity.User;
import AppDev.CampusMarketplace.Repository.UserRepository;
import AppDev.CampusMarketplace.Service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        System.out.println("Filter checking request for: " + request.getRequestURI());
        System.out.println("Auth Header found: " + (authHeader != null));

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // This is where it's likely failing for /api/cart/add
            filterChain.doFilter(request, response);
            return;
        }
        
        if (authHeader != null && authHeader.startsWith("Bearer ")
            && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            String token = authHeader.substring(7);
            
            // --- START REPLACEMENT ---
            if (jwtService.isValid(token)) {
                String email = jwtService.extractEmail(token);
                User user = userRepository.findByEmail(email).orElse(null);
                
                if (user != null) {
                    Role role = user.getRole() != null ? user.getRole() : Role.CUSTOMER;
                    
                    // DEBUG: Print exactly what is being generated
                    String authorityName = "ROLE_" + role.name();
                    System.out.println("DEBUG: Generating Authority: " + authorityName);

                    List<SimpleGrantedAuthority> authorities = List.of(
                            new SimpleGrantedAuthority(authorityName)
                    );

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            authorities
                    );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } else {
                // THIS IS THE SMOKING GUN:
                System.out.println("DEBUG: Token validation failed for string: " + (token.length() > 10 ? token.substring(0, 10) : token) + "...");
            }
            // --- END REPLACEMENT ---
        }
        
        System.out.println("Filter checking request for: " + request.getServletPath());
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            System.out.println("User Authenticated: " + SecurityContextHolder.getContext().getAuthentication().getName());
            System.out.println("Authorities: " + SecurityContextHolder.getContext().getAuthentication().getAuthorities());
        } else {
            System.out.println("User NOT Authenticated");
        }
        filterChain.doFilter(request, response);
    }
}
