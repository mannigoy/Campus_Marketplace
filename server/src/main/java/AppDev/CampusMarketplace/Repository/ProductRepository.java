package AppDev.CampusMarketplace.Repository;

import AppDev.CampusMarketplace.Entity.Product;
import AppDev.CampusMarketplace.Entity.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findBySellerId(Long sellerId);
    List<Product> findByStatus(ProductStatus status);
    List<Product> findBySellerSellerStoreId(Long sellerStoreId);
}
