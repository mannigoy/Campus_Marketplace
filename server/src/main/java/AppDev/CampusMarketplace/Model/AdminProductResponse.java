package AppDev.CampusMarketplace.Model;

import AppDev.CampusMarketplace.Entity.Product;
import AppDev.CampusMarketplace.Entity.SellerStore;

import java.math.BigDecimal;

public class AdminProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stockQuantity;
    private String imageUrl;
    private String category;
    private String status;
    private Long sellerId;
    private String storeName;
    private Long storeId;
    private String storeImageUrl;

    public static AdminProductResponse fromEntity(Product product) {
        AdminProductResponse response = new AdminProductResponse();
        response.id = product.getId();
        response.name = product.getName();
        response.description = product.getDescription();
        response.price = product.getPrice();
        response.stockQuantity = product.getStockQuantity();
        response.imageUrl = product.getImageUrl();
        response.category = product.getCategory();
        response.status = product.getStatus() != null ? product.getStatus().name() : null;
        if (product.getSeller() != null) {
            response.sellerId = product.getSeller().getId();
        }

        SellerStore store = product.getStore();
        if (store == null && product.getSeller() != null) {
            store = product.getSeller().getSellerStore();
        }
        if (store != null) {
            response.storeId = store.getId();
            response.storeName = store.getStoreName();
            response.storeImageUrl = store.getImageUrl();
        }
        return response;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public BigDecimal getPrice() { return price; }
    public Integer getStockQuantity() { return stockQuantity; }
    public String getImageUrl() { return imageUrl; }
    public String getCategory() { return category; }
    public String getStatus() { return status; }
    public Long getSellerId() { return sellerId; }
    public String getStoreName() { return storeName; }
    public Long getStoreId() { return storeId; }
    public String getStoreImageUrl() { return storeImageUrl; }
}
