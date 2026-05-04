package AppDev.CampusMarketplace.Model;

import AppDev.CampusMarketplace.Entity.User;

public class AdminUserResponse {
    private Long id;
    private String email;
    private String username;
    private String role;
    private boolean isApprovedSeller;
    private String storeName;

    public static AdminUserResponse fromEntity(User user) {
        AdminUserResponse response = new AdminUserResponse();
        response.id = user.getId();
        response.email = user.getEmail();
        response.username = user.getUsername();
        response.role = user.getRole() != null ? user.getRole().name() : "";
        response.isApprovedSeller = user.isApprovedSeller();
        response.storeName = user.getSellerStore() != null ? user.getSellerStore().getStoreName() : "";
        return response;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getUsername() { return username; }
    public String getRole() { return role; }
    public boolean isApprovedSeller() { return isApprovedSeller; }
    public String getStoreName() { return storeName; }
}
