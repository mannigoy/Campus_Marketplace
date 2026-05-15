package AppDev.CampusMarketplace.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import AppDev.CampusMarketplace.Entity.CustomerOrderItem;

public interface CustomerOrderItemRepository extends JpaRepository<CustomerOrderItem, Long> {
}
