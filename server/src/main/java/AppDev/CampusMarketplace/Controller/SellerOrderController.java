package AppDev.CampusMarketplace.Controller;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import AppDev.CampusMarketplace.Entity.CustomerOrder;
import AppDev.CampusMarketplace.Entity.CustomerOrderItem;
import AppDev.CampusMarketplace.Entity.OrderStatus;
import AppDev.CampusMarketplace.Entity.User;
import AppDev.CampusMarketplace.Repository.UserRepository;
import AppDev.CampusMarketplace.Service.OrderService;

@RestController
@RequestMapping("/api/seller/orders")
public class SellerOrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    public SellerOrderController(OrderService orderService, UserRepository userRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<?> getSellerOrders() {
        User seller = getCurrentUser();

        List<Map<String, Object>> orders = orderService.getSellerOrders(seller).stream()
                .map(order -> toSellerResponse(order, seller.getId()))
                .filter(response -> {
                    Object items = response.get("items");
                    return items instanceof List && !((List<?>) items).isEmpty();
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{orderId}/mark-paid")
    public ResponseEntity<?> markOrderPaid(@PathVariable Long orderId) {
        try {
            User seller = getCurrentUser();
            CustomerOrder order = orderService.markOrderPaid(orderId, seller);
            return ResponseEntity.ok(toSellerResponse(order, seller.getId()));
        } catch (RuntimeException e) {
            String message = e.getMessage() == null ? "Unable to update payment status" : e.getMessage();
            return ResponseEntity.badRequest().body(Map.of("error", message));
        }
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> payload
    ) {
        try {
            String rawStatus = payload == null ? null : payload.get("orderStatus");
            OrderStatus nextStatus = parseOrderStatus(rawStatus);
            if (nextStatus == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid order status"));
            }

            User seller = getCurrentUser();
            CustomerOrder order = orderService.updateOrderStatus(orderId, seller, nextStatus);
            return ResponseEntity.ok(toSellerResponse(order, seller.getId()));
        } catch (RuntimeException e) {
            String message = e.getMessage() == null ? "Unable to update order status" : e.getMessage();
            return ResponseEntity.badRequest().body(Map.of("error", message));
        }
    }

    private Map<String, Object> toSellerResponse(CustomerOrder order, Long sellerId) {
        List<CustomerOrderItem> sellerItems = order.getItems().stream()
                .filter(item -> isSellerItem(item, sellerId))
                .collect(Collectors.toList());

        BigDecimal subtotal = sellerItems.stream()
                .map(CustomerOrderItem::getLineTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Map<String, Object>> items = sellerItems.stream()
                .map(this::itemToResponse)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("id", order.getId());
        response.put("customerName", order.getCustomerName());
        response.put("customerEmail", order.getCustomerEmail());
        response.put("contactNumber", order.getContactNumber());
        response.put("pickupDate", order.getPickupDate().toString());
        response.put("pickupTime", order.getPickupTime().toString());
        response.put("pickupLocation", order.getPickupLocation());
        response.put("paymentMethod", order.getPaymentMethod());
        response.put("paymentStatus", order.getPaymentStatus().name());
        response.put("orderStatus", order.getOrderStatus().name());
        response.put("subtotal", subtotal);
        response.put("createdAt", order.getCreatedAt().toString());
        response.put("items", items);

        return response;
    }

    private Map<String, Object> itemToResponse(CustomerOrderItem item) {
        Map<String, Object> response = new HashMap<>();
        var product = item.getProduct();

        response.put("id", item.getId());
        response.put("productId", product != null ? product.getId() : null);
        response.put("productName", item.getProductName());
        response.put("imageUrl", product != null ? product.getImageUrl() : null);
        response.put("unitPrice", item.getUnitPrice());
        response.put("quantity", item.getQuantity());
        response.put("lineTotal", item.getLineTotal());

        return response;
    }

    private boolean isSellerItem(CustomerOrderItem item, Long sellerId) {
        return item.getProduct() != null
                && item.getProduct().getSeller() != null
                && item.getProduct().getSeller().getId() != null
                && item.getProduct().getSeller().getId().equals(sellerId);
    }

    private OrderStatus parseOrderStatus(String rawStatus) {
        if (rawStatus == null || rawStatus.isBlank()) {
            return null;
        }
        String normalized = rawStatus.trim().toUpperCase().replace(" ", "_");
        try {
            return OrderStatus.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new RuntimeException("Unauthorized.");
        }

        String email = authentication.getPrincipal().toString();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));
    }
}
