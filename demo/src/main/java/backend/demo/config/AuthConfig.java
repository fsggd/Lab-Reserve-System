package backend.demo.config;

import backend.demo.common.auth.AuthInterceptor;
import backend.demo.common.auth.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 鉴权与密码加密配置
 */
@Configuration
@RequiredArgsConstructor
public class AuthConfig implements WebMvcConfigurer {

    private final JwtUtil jwtUtil;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new AuthInterceptor(jwtUtil))
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/auth/login", "/api/health");
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
