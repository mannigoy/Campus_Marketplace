package AppDev.CampusMarketplace.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import AppDev.CampusMarketplace.Entity.CustomerOrder;
import AppDev.CampusMarketplace.Entity.User;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {
    List<CustomerOrder> findByBuyerOrderByCreatedAtDesc(User buyer);

    @Query("select distinct o from CustomerOrder o join o.items i join i.product p where p.seller.id = :sellerId order by o.createdAt desc")
    List<CustomerOrder> findBySellerIdOrderByCreatedAtDesc(@Param("sellerId") Long sellerId);
}
