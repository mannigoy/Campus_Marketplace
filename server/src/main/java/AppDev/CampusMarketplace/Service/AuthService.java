package AppDev.CampusMarketplace.Service;

import AppDev.CampusMarketplace.Entity.OtpCode;
import AppDev.CampusMarketplace.Entity.Role;
import AppDev.CampusMarketplace.Entity.User;
import AppDev.CampusMarketplace.Repository.OtpRepository;
import AppDev.CampusMarketplace.Repository.SellerApplicationRepository;
import AppDev.CampusMarketplace.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final OtpRepository otpRepository;
    private final SellerApplicationRepository sellerApplicationRepository;
    private final EmailService emailService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Value("${app.superadmin.email:}")
    private String superadminEmail;

    public AuthService(UserRepository userRepository, OtpRepository otpRepository,
                       SellerApplicationRepository sellerApplicationRepository,
                       EmailService emailService, JwtService jwtService) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.sellerApplicationRepository = sellerApplicationRepository;
        this.emailService = emailService;
        this.jwtService = jwtService;
    }

    public Map<String, Object> register(String email, String password) {
        validateEmail(email);
        validatePassword(password);

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered.");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setVerified(false);
        user.setRole(resolveInitialRole(email));
        userRepository.save(user);

        sendOtp(email);
        return Map.of("message", "OTP sent successfully.");
    }

    public Map<String, Object> login(String email, String password) {
        validateEmail(email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password."));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password.");
        }

        if (!user.isVerified()) {
            throw new RuntimeException("Account not verified. Please verify OTP.");
        }

        String token = jwtService.generateToken(email);
        boolean hasUsername = user.getUsername() != null;

        return Map.of(
                "token", token,
                "hasUsername", hasUsername,
                "email", email,
                "role", getSafeRole(user).name(),
                "isApprovedSeller", user.isApprovedSeller(),
                "applicationStatus", getApplicationStatus(user)
        );
    }

    public void sendOtp(String email) {
        validateEmail(email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));
        if (user.isVerified()) {
            throw new RuntimeException("Account already verified.");
        }

        otpRepository.deleteByEmail(email);

        String code = String.format("%06d", new Random().nextInt(999999));

        OtpCode otp = new OtpCode();
        otp.setEmail(email);
        otp.setCode(code);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        otp.setUsed(false);
        otpRepository.save(otp);

        emailService.sendOtp(email, code);
    }

    @Transactional
    public Map<String, Object> verifyOtp(String email, String code) {
        OtpCode otp = otpRepository.findTopByEmailOrderByExpiresAtDesc(email)
                .orElseThrow(() -> new RuntimeException("No OTP found."));

        if (otp.isUsed()) throw new RuntimeException("OTP already used.");
        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) throw new RuntimeException("OTP expired.");
        if (!otp.getCode().equals(code)) throw new RuntimeException("Invalid code.");

        otp.setUsed(true);
        otpRepository.save(otp);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        user.setVerified(true);
        userRepository.save(user);

        String token = jwtService.generateToken(email);
        boolean hasUsername = user.getUsername() != null;

        return Map.of(
                "token", token,
                "hasUsername", hasUsername,
                "email", email,
                "role", getSafeRole(user).name(),
                "isApprovedSeller", user.isApprovedSeller(),
                "applicationStatus", getApplicationStatus(user)
        );
    }

    public Map<String, Object> saveUsername(String token, String username) {
        if (!jwtService.isValid(token)) throw new RuntimeException("Invalid token.");
        if (userRepository.existsByUsername(username)) throw new RuntimeException("Username taken.");

        String email = jwtService.extractEmail(token);
        User user = userRepository.findByEmail(email).orElseThrow();
        user.setUsername(username);
        userRepository.save(user);

        return Map.of("success", true, "username", username);
    }

    public Map<String, Object> getCurrentUser(String token) {
        if (!jwtService.isValid(token)) throw new RuntimeException("Invalid token.");

        String email = jwtService.extractEmail(token);
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found."));

        Role role = getSafeRole(user);
        return Map.of(
                "email", user.getEmail(),
                "username", user.getUsername() != null ? user.getUsername() : "",
                "id", user.getId(),
                "role", role.name(),
            "isApprovedSeller", user.isApprovedSeller(),
            "applicationStatus", getApplicationStatus(user)
        );
    }

    private Role resolveInitialRole(String email) {
        if (superadminEmail != null && !superadminEmail.isBlank()
                && superadminEmail.equalsIgnoreCase(email)) {
            return Role.SUPERADMIN;
        }
        return Role.CUSTOMER;
    }

    private Role getSafeRole(User user) {
        if (user.getRole() == null) {
            user.setRole(Role.CUSTOMER);
            userRepository.save(user);
        }
        return user.getRole();
    }

    private String getApplicationStatus(User user) {
        return sellerApplicationRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId())
                .map(application -> application.getStatus().name())
                .orElse("NONE");
    }

    private void validateEmail(String email) {
        if (email == null || !email.endsWith("@cit.edu")) {
            throw new RuntimeException("Only @cit.edu emails are allowed.");
        }
    }

    private void validatePassword(String password) {
        if (password == null || password.length() < 10) {
            throw new RuntimeException("Password must be at least 10 characters.");
        }
        if (!password.matches(".*[A-Za-z].*")) {
            throw new RuntimeException("Password must contain at least one letter.");
        }
        if (!password.matches(".*\\d.*")) {
            throw new RuntimeException("Password must contain at least one number.");
        }
    }
}
