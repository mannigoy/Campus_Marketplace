package AppDev.CampusMarketplace.Repository;

import AppDev.CampusMarketplace.Entity.Cart;
import AppDev.CampusMarketplace.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    // This allows the Service to find the cart linked to a specific user
    Optional<Cart> findByUser(User user);
}