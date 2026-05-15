package AppDev.CampusMarketplace.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import AppDev.CampusMarketplace.Entity.CustomerOrder;
import AppDev.CampusMarketplace.Entity.CustomerOrderItem;
import AppDev.CampusMarketplace.Entity.User;
import AppDev.CampusMarketplace.Model.CheckoutRequest;
import AppDev.CampusMarketplace.Repository.UserRepository;
import AppDev.CampusMarketplace.Service.JwtService;
import AppDev.CampusMarketplace.Service.OrderService;

@RestController
@RequestMapping("/api/orders")
public class CustomerOrderController {

    private final OrderService orderService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public CustomerOrderController(
            OrderService orderService,
            JwtService jwtService,
            UserRepository userRepository
    ) {
        this.orderService = orderService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    private User getUserFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing authorization token");
        }

        String token = authHeader.replace("Bearer ", "").trim();
        String email = jwtService.extractEmail(token);

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody CheckoutRequest request
    ) {
        try {
            User buyer = getUserFromToken(authHeader);

            CustomerOrder order = orderService.checkout(buyer, request);

            return ResponseEntity.ok(toResponse(order));

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );
        }
    }

    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(
            @RequestHeader("Authorization") String authHeader
    ) {

        User buyer = getUserFromToken(authHeader);

        List<Map<String, Object>> orders = orderService
                .getBuyerOrders(buyer)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(orders);
    }

    private Map<String, Object> toResponse(CustomerOrder order) {

        List<Map<String, Object>> items = order.getItems()
                .stream()
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
        response.put("totalAmount", order.getTotalAmount());
        response.put("createdAt", order.getCreatedAt().toString());
        response.put("items", items);

        return response;
    }

    private Map<String, Object> itemToResponse(CustomerOrderItem item) {

        Map<String, Object> response = new HashMap<>();

        response.put("id", item.getId());
        response.put("productId", item.getProduct().getId());
        response.put("productName", item.getProductName());
        response.put("unitPrice", item.getUnitPrice());
        response.put("quantity", item.getQuantity());
        response.put("lineTotal", item.getLineTotal());

        return response;
    }
}