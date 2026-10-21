package mecanica.ec.cue.backend.security;

import java.io.IOException;
import java.time.Instant;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/usuarios").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/usuarios").hasRole("ADMIN")
                        .requestMatchers("/api/reportes/**").hasRole("ADMIN")
                        // La tarifa vigente la lee cualquiera; el historial y los cambios, solo el admin.
                        .requestMatchers(HttpMethod.GET, "/api/configuracion/iva").authenticated()
                        .requestMatchers("/api/configuracion/**").hasRole("ADMIN")
                        // Facturar, cobrar y ver facturas: admin y caja. El mecánico solo carga items;
                        // sí puede consultar si una orden ya está facturada (GET /api/ordenes/{id}/factura).
                        .requestMatchers(HttpMethod.POST, "/api/ordenes/*/factura").hasAnyRole("ADMIN", "CAJA")
                        .requestMatchers("/api/facturas/**").hasAnyRole("ADMIN", "CAJA")
                        // Inventario: el mecánico solo lee productos (para elegir repuestos en una orden);
                        // crear/editar productos y los movimientos son de admin y caja.
                        .requestMatchers(HttpMethod.GET, "/api/productos/**").authenticated()
                        .requestMatchers("/api/productos/**").hasAnyRole("ADMIN", "CAJA")
                        .requestMatchers("/api/movimientos-inventario/**").hasAnyRole("ADMIN", "CAJA")
                        .requestMatchers(HttpMethod.POST, "/api/marcas/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/marcas/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/marcas/**").hasRole("ADMIN")
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())
                .exceptionHandling(handling -> handling
                        .authenticationEntryPoint(authenticationEntryPoint())
                        .accessDeniedHandler(accessDeniedHandler()))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    private AuthenticationEntryPoint authenticationEntryPoint() {
        return (request, response, authException) -> writeError(response, HttpStatus.UNAUTHORIZED, "No autenticado");
    }

    private AccessDeniedHandler accessDeniedHandler() {
        return (request, response, accessDeniedException) -> writeError(response, HttpStatus.FORBIDDEN,
                "No autorizado para este recurso");
    }

    private static void writeError(HttpServletResponse response, HttpStatus status, String message)
            throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json");
        String body = """
                {"timestamp":"%s","status":%d,"error":"%s","message":"%s"}""".formatted(
                Instant.now(), status.value(), status.getReasonPhrase(), message);
        response.getWriter().write(body);
    }
}
