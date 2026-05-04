package AppDev.CampusMarketplace.Repository;

import AppDev.CampusMarketplace.Entity.SellerApplication;
import AppDev.CampusMarketplace.Entity.SellerApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SellerApplicationRepository extends JpaRepository<SellerApplication, Long> {
    List<SellerApplication> findByStatus(SellerApplicationStatus status);
    boolean existsByUserIdAndStatus(Long userId, SellerApplicationStatus status);
    Optional<SellerApplication> findTopByUserIdOrderByCreatedAtDesc(Long userId);
}
