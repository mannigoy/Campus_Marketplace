package AppDev.CampusMarketplace.Repository;

import AppDev.CampusMarketplace.Entity.Cart;
import AppDev.CampusMarketplace.Entity.Product;
import AppDev.CampusMarketplace.Entity.CartItem;
import AppDev.CampusMarketplace.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUser(User user);
    
    // This looks for the unique combination of a specific cart and product
    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);
}