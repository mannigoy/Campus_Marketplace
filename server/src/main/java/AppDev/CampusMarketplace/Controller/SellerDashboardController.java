package AppDev.CampusMarketplace.Controller;

import AppDev.CampusMarketplace.Entity.Product;
import AppDev.CampusMarketplace.Entity.User;
import AppDev.CampusMarketplace.Model.ProductRequest;
import AppDev.CampusMarketplace.Model.ProductResponse;
import AppDev.CampusMarketplace.Repository.ProductRepository;
import AppDev.CampusMarketplace.Repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/seller")
public class SellerDashboardController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public SellerDashboardController(UserRepository userRepository, ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        User user = getCurrentUser();

        Map<String, Object> stats = Map.of(
                "totalRevenue", 0,
                "orders", 0,
                "products", 0,
                "customers", 0
        );

        return ResponseEntity.ok(Map.of(
                "sellerId", user.getId(),
                "stats", stats,
                "recentOrders", List.of(),
                "lowStockProducts", List.of()
        ));
    }

    @GetMapping("/products")
    public ResponseEntity<?> getProducts() {
        User user = getCurrentUser();
        List<ProductResponse> products = productRepository.findBySellerId(user.getId())
                .stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(products);
    }

    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@RequestBody ProductRequest request) {
        User user = getCurrentUser();

        if (request.getName() == null || request.getName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name is required."));
        }
        if (request.getPrice() == null || request.getPrice().signum() < 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Price must be 0 or higher."));
        }
        if (request.getStockQuantity() == null || request.getStockQuantity() < 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Stock quantity must be 0 or higher."));
        }

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(request.getCategory());
        product.setSeller(user);

        Product saved = productRepository.save(product);
        return ResponseEntity.ok(ProductResponse.fromEntity(saved));
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
