package AppDev.CampusMarketplace.Model;

import AppDev.CampusMarketplace.Entity.SellerApplication;
import AppDev.CampusMarketplace.Entity.SellerApplicationStatus;
import AppDev.CampusMarketplace.Entity.SellerStore;

import java.time.LocalDateTime;

public class AdminStoreResponse {
    private Long id;
    private String storeName;
    private String description;
    private String applicationStatus;
    private String status;
    private LocalDateTime createdAt;
    private Long ownerId;
    private String ownerEmail;
    private String ownerUsername;

    public static AdminStoreResponse fromEntity(SellerStore store, SellerApplication application) {
        AdminStoreResponse response = new AdminStoreResponse();
        response.id = store.getId();
        response.storeName = store.getStoreName();
        response.description = store.getDescription();

        response.applicationStatus = application != null
                ? application.getStatus().name()
                : "UNKNOWN";

        response.status = store.getStatus() != null ? store.getStatus().name() : null;

        response.createdAt = store.getCreatedAt();
        if (store.getUser() != null) {
            response.ownerId = store.getUser().getId();
            response.ownerEmail = store.getUser().getEmail();
            response.ownerUsername = store.getUser().getUsername();
        }
        return response;
    }

    public Long getId() { return id; }
    public String getStoreName() { return storeName; }
    public String getDescription() { return description; }
    public String getApplicationStatus() { return applicationStatus; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public Long getOwnerId() { return ownerId; }
    public String getOwnerEmail() { return ownerEmail; }
    public String getOwnerUsername() { return ownerUsername; }
}