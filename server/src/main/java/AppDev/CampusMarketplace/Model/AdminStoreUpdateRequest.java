package AppDev.CampusMarketplace.Model;

import AppDev.CampusMarketplace.Entity.StoreStatus;

public class AdminStoreUpdateRequest {
    private String storeName;
    private String description;
    private String imageUrl;
    private StoreStatus status;

    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public StoreStatus getStatus() { return status; }
    public void setStatus(StoreStatus status) { this.status = status; }
}
