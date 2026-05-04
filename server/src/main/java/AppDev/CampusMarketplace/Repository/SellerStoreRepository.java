package AppDev.CampusMarketplace.Repository;

import AppDev.CampusMarketplace.Entity.SellerStore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SellerStoreRepository extends JpaRepository<SellerStore, Long> {
    Optional<SellerStore> findByUserId(Long userId);
}
