package AppDev.CampusMarketplace.Model;

import AppDev.CampusMarketplace.Entity.SellerStore;

import java.time.LocalDateTime;

public class ShopResponse {
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private Integer productCount;
    private LocalDateTime createdAt;

    public static ShopResponse fromEntity(SellerStore store, Integer productCount) {
        ShopResponse response = new ShopResponse();
        response.id = store.getId();
        response.name = store.getStoreName();
        response.description = store.getDescription();
        response.imageUrl = store.getImageUrl();
        response.createdAt = store.getCreatedAt();
        response.productCount = productCount;
        return response;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getImageUrl() { return imageUrl; }
    public Integer getProductCount() { return productCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
