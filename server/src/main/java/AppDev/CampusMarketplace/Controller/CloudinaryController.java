package AppDev.CampusMarketplace.Controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;

@RestController
@RequestMapping("/api/cloudinary")
public class CloudinaryController {

    @Value("${cloudinary.cloud_name}")
    private String cloudName;

    @Value("${cloudinary.api_key}")
    private String apiKey;

    @Value("${cloudinary.api_secret}")
    private String apiSecret;

    @Value("${cloudinary.folder:}")
    private String folder;

    @PostMapping("/sign")
    public Map<String, Object> sign() {
        if (apiSecret == null || apiSecret.isBlank()) {
            throw new RuntimeException("Cloudinary API secret is missing. Set CLOUDINARY_API_SECRET env var.");
        }
        long timestamp = System.currentTimeMillis() / 1000L;
        String payload = buildSignaturePayload(timestamp);
        String signature = sha1(payload + apiSecret);

        return Map.of(
                "timestamp", timestamp,
                "signature", signature,
                "apiKey", apiKey,
                "cloudName", cloudName,
                "folder", folder
        );
    }

    private String buildSignaturePayload(long timestamp) {
        if (folder != null && !folder.isBlank()) {
            return "folder=" + folder + "&timestamp=" + timestamp;
        }
        return "timestamp=" + timestamp;
    }

    private String sha1(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-1");
            byte[] bytes = md.digest(input.getBytes());
            return HexFormat.of().formatHex(bytes);
        } catch (Exception e) {
            throw new RuntimeException("Failed to sign upload.");
        }
    }
}
