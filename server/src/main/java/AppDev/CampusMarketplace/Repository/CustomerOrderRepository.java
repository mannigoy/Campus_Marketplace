package AppDev.CampusMarketplace.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import AppDev.CampusMarketplace.Entity.CustomerOrder;
import AppDev.CampusMarketplace.Entity.User;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {
    List<CustomerOrder> findByBuyerOrderByCreatedAtDesc(User buyer);
}
