package com.smartcampus.backend.security;

import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.UserRepository;
import com.smartcampus.backend.service.LoginAuditService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final LoginAuditService loginAuditService;
    private final JwtService jwtService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

            // Detect provider (google vs github)
            String provider = "UNKNOWN";
            if (authentication instanceof OAuth2AuthenticationToken token) {
                provider = token.getAuthorizedClientRegistrationId().toUpperCase();
            }

            // Resolve email — GitHub uses 'email', Google uses 'email' too,
            // but GitHub's may be null if private (handled in CustomOAuth2UserService already)
            String email = oAuth2User.getAttribute("email");

            // For GitHub, fall back to 'login' attribute as the lookup key only if email is still null
            if (email == null && "GITHUB".equals(provider)) {
                String login = oAuth2User.getAttribute("login");
                if (login != null) {
                    Optional<User> byLogin = userRepository.findAll().stream()
                        .filter(u -> login.equalsIgnoreCase(u.getName()))
                        .findFirst();
                    if (byLogin.isPresent()) {
                        email = byLogin.get().getEmail();
                    }
                }
            }

            if (email == null) {
                String encoded = URLEncoder.encode("Could not resolve your email. Please make your email public on GitHub.", StandardCharsets.UTF_8);
                response.sendRedirect(frontendUrl + "/login?oauthError=" + encoded);
                return;
            }

            final String normalizedEmail = email.trim().toLowerCase();
            Optional<User> userOptional = userRepository.findByEmailIgnoreCase(normalizedEmail);
            
            // Generate JWT Token
            String token = jwtService.generateToken(normalizedEmail);
            String role = "USER";

            if (userOptional.isPresent()) {
                User user = userOptional.get();
                role = user.getRole().name();
                loginAuditService.logSuccess(user.getId(), user.getName(), user.getEmail(), role, provider, request.getRemoteAddr());
            }

            String targetUrl = frontendUrl + "/oauth-callback?token=" + token + "&role=" + role;
            getRedirectStrategy().sendRedirect(request, response, targetUrl);

        } catch (Exception ex) {
            String encoded = URLEncoder.encode(
                ex.getMessage() == null ? "OAuth sign-in failed." : ex.getMessage(),
                StandardCharsets.UTF_8
            );
            response.sendRedirect(frontendUrl + "/login?oauthError=" + encoded);
        }
    }
}
