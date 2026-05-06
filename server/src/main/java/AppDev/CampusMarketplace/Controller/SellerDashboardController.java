package AppDev.CampusMarketplace.Controller;

import AppDev.CampusMarketplace.Entity.Product;
import AppDev.CampusMarketplace.Entity.ProductStatus;
import AppDev.CampusMarketplace.Entity.SellerStore;
import AppDev.CampusMarketplace.Entity.User;
import AppDev.CampusMarketplace.Model.AdminStoreUpdateRequest;
import AppDev.CampusMarketplace.Model.ProductRequest;
import AppDev.CampusMarketplace.Model.ProductResponse;
import AppDev.CampusMarketplace.Model.ProductUpdateRequest;
import AppDev.CampusMarketplace.Repository.ProductRepository;
import AppDev.CampusMarketplace.Repository.SellerStoreRepository;
import AppDev.CampusMarketplace.Repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
    private final SellerStoreRepository sellerStoreRepository;

    public SellerDashboardController(UserRepository userRepository,
                                     ProductRepository productRepository,
                                     SellerStoreRepository sellerStoreRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.sellerStoreRepository = sellerStoreRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        User user = getCurrentUser();
        SellerStore sellerStore = user.getSellerStore();
        if (sellerStore == null) {
            sellerStore = sellerStoreRepository.findByUserId(user.getId()).orElse(null);
        }
        String storeName = "";
        Map<String, Object> store = Map.of();
        if (sellerStore != null) {
            storeName = sellerStore.getStoreName();
            store = Map.of(
                    "id", sellerStore.getId(),
                    "userId", user.getId(),
                    "storeName", sellerStore.getStoreName(),
                    "description", sellerStore.getDescription() != null ? sellerStore.getDescription() : ""
            );
        }

        Map<String, Object> stats = Map.of(
                "totalRevenue", 0,
                "orders", 0,
                "products", 0,
                "customers", 0
        );

        return ResponseEntity.ok(Map.of(
                "sellerId", user.getId(),
                "storeName", storeName,
                "store", store,
                "stats", stats,
                "recentOrders", List.of(),
                "lowStockProducts", List.of()
        ));
    }

    @GetMapping("/store")
    public ResponseEntity<?> getStoreSettings() {
        User user = getCurrentUser();
        SellerStore store = sellerStoreRepository.findByUserId(user.getId())
                .orElseGet(user::getSellerStore);

        if (store == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Store not found for this account."));
        }

        return ResponseEntity.ok(Map.of(
                "id", store.getId(),
                "userId", user.getId(),
                "storeName", store.getStoreName(),
                "description", store.getDescription() != null ? store.getDescription() : ""
        ));
    }

    @PutMapping("/store")
    public ResponseEntity<?> updateStoreSettings(@RequestBody AdminStoreUpdateRequest request) {
        User user = getCurrentUser();
        SellerStore store = sellerStoreRepository.findByUserId(user.getId())
                .orElseGet(user::getSellerStore);

        if (store == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Store not found for this account."));
        }

        if (request.getStoreName() == null || request.getStoreName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Store name is required."));
        }

        store.setStoreName(request.getStoreName().trim());
        store.setDescription(request.getDescription());

        SellerStore saved = sellerStoreRepository.save(store);
        return ResponseEntity.ok(Map.of(
                "id", saved.getId(),
                "userId", user.getId(),
                "storeName", saved.getStoreName(),
                "description", saved.getDescription() != null ? saved.getDescription() : ""
        ));
    }

    @PutMapping("/stores/{storeId}")
    public ResponseEntity<?> updateStore(@PathVariable Long storeId, @RequestBody AdminStoreUpdateRequest request) {
        User user = getCurrentUser();
        SellerStore store = sellerStoreRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found."));

        if (store.getUser() == null || !store.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden."));
        }

        if (request.getStoreName() != null && !request.getStoreName().isBlank()) {
            store.setStoreName(request.getStoreName());
        }
        if (request.getDescription() != null) {
            store.setDescription(request.getDescription());
        }

        SellerStore saved = sellerStoreRepository.save(store);
        return ResponseEntity.ok(Map.of(
                "id", saved.getId(),
                "userId", user.getId(),
                "storeName", saved.getStoreName(),
                "description", saved.getDescription() != null ? saved.getDescription() : ""
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
        product.setStatus(ProductStatus.ACTIVE);
        product.setSeller(user);

        Product saved = productRepository.save(product);
        return ResponseEntity.ok(ProductResponse.fromEntity(saved));
    }

    @PutMapping("/products/{productId}")
    public ResponseEntity<?> updateProduct(@PathVariable Long productId, @RequestBody ProductUpdateRequest request) {
        User user = getCurrentUser();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found."));

        if (product.getSeller() == null || !product.getSeller().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden."));
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            product.setName(request.getName());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            if (request.getPrice().signum() < 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Price must be 0 or higher."));
            }
            product.setPrice(request.getPrice());
        }
        if (request.getStockQuantity() != null) {
            if (request.getStockQuantity() < 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Stock quantity must be 0 or higher."));
            }
            product.setStockQuantity(request.getStockQuantity());
        }
        if (request.getImageUrl() != null) {
            product.setImageUrl(request.getImageUrl());
        }
        if (request.getCategory() != null) {
            product.setCategory(request.getCategory());
        }

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
