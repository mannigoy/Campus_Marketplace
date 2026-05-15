package AppDev.CampusMarketplace.Model;

import AppDev.CampusMarketplace.Entity.SellerApplication;
import AppDev.CampusMarketplace.Entity.SellerApplicationStatus;
import AppDev.CampusMarketplace.Entity.SellerStore;

import java.time.LocalDateTime;

public class AdminStoreResponse {
    private Long id;
    private String storeName;
    private String description;
    private String imageUrl;
    private String applicationStatus;
    private String status;
    private LocalDateTime createdAt;
    private Long ownerId;
    private String ownerEmail;
    private String ownerUsername;
    private Long createdById;
    private String createdByEmail;
    private String createdByUsername;

    public static AdminStoreResponse fromEntity(SellerStore store, SellerApplication application) {
        AdminStoreResponse response = new AdminStoreResponse();
        response.id = store.getId();
        response.storeName = store.getStoreName();
        response.description = store.getDescription();
        response.imageUrl = store.getImageUrl();

        response.applicationStatus = application != null
                ? application.getStatus().name()
                : "ADMIN";

        response.status = store.getStatus() != null ? store.getStatus().name() : null;

        response.createdAt = store.getCreatedAt();
        if (store.getUser() != null) {
            response.ownerId = store.getUser().getId();
            response.ownerEmail = store.getUser().getEmail();
            response.ownerUsername = store.getUser().getUsername();
        }
        if (store.getCreatedBy() != null) {
            response.createdById = store.getCreatedBy().getId();
            response.createdByEmail = store.getCreatedBy().getEmail();
            response.createdByUsername = store.getCreatedBy().getUsername();
        }
        return response;
    }

    public Long getId() { return id; }
    public String getStoreName() { return storeName; }
    public String getDescription() { return description; }
    public String getImageUrl() { return imageUrl; }
    public String getApplicationStatus() { return applicationStatus; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public Long getOwnerId() { return ownerId; }
    public String getOwnerEmail() { return ownerEmail; }
    public String getOwnerUsername() { return ownerUsername; }
    public Long getCreatedById() { return createdById; }
    public String getCreatedByEmail() { return createdByEmail; }
    public String getCreatedByUsername() { return createdByUsername; }
}