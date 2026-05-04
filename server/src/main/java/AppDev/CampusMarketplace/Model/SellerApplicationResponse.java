package AppDev.CampusMarketplace.Model;

import AppDev.CampusMarketplace.Entity.SellerApplication;

import java.time.LocalDateTime;

public class SellerApplicationResponse {
    private Long id;
    private Long userId;
    private String username;
    private String email;
    private String shopName;
    private String reason;
    private String studentIdImage;
    private String status;
    private LocalDateTime createdAt;

    public static SellerApplicationResponse fromEntity(SellerApplication application) {
        SellerApplicationResponse response = new SellerApplicationResponse();
        response.id = application.getId();
        response.userId = application.getUser().getId();
        response.username = application.getUser().getUsername();
        response.email = application.getUser().getEmail();
        response.shopName = application.getShopName();
        response.reason = application.getReason();
        response.studentIdImage = application.getStudentIdImage();
        response.status = application.getStatus().name();
        response.createdAt = application.getCreatedAt();
        return response;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getShopName() { return shopName; }
    public String getReason() { return reason; }
    public String getStudentIdImage() { return studentIdImage; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
