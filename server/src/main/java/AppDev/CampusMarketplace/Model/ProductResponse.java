package AppDev.CampusMarketplace.Model;

import AppDev.CampusMarketplace.Entity.Product;

import java.math.BigDecimal;

public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stockQuantity;
    private String imageUrl;
    private String category;
    private String status;
    private Long storeId;
    private String storeName;
    private String storeImageUrl;

    public static ProductResponse fromEntity(Product product) {
        ProductResponse response = new ProductResponse();
        response.id = product.getId();
        response.name = product.getName();
        response.description = product.getDescription();
        response.price = product.getPrice();
        response.stockQuantity = product.getStockQuantity();
        response.imageUrl = product.getImageUrl();
        response.category = product.getCategory();
        response.status = product.getStatus() != null ? product.getStatus().name() : null;
        if (product.getSeller() != null && product.getSeller().getSellerStore() != null) {
            response.storeId = product.getSeller().getSellerStore().getId();
            response.storeName = product.getSeller().getSellerStore().getStoreName();
            response.storeImageUrl = product.getSeller().getSellerStore().getImageUrl();
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
    public Long getStoreId() { return storeId; }
    public String getStoreName() { return storeName; }
    public String getStoreImageUrl() { return storeImageUrl; }
}
