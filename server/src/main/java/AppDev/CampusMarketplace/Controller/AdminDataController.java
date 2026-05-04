package AppDev.CampusMarketplace.Controller;

import AppDev.CampusMarketplace.Entity.Product;
import AppDev.CampusMarketplace.Entity.SellerApplication;
import AppDev.CampusMarketplace.Entity.SellerStore;
import AppDev.CampusMarketplace.Entity.User;
import AppDev.CampusMarketplace.Model.AdminProductResponse;
import AppDev.CampusMarketplace.Model.AdminProductUpdateRequest;
import AppDev.CampusMarketplace.Model.AdminStoreResponse;
import AppDev.CampusMarketplace.Model.AdminStoreUpdateRequest;
import AppDev.CampusMarketplace.Model.AdminUserResponse;
import AppDev.CampusMarketplace.Repository.ProductRepository;
import AppDev.CampusMarketplace.Repository.SellerApplicationRepository;
import AppDev.CampusMarketplace.Repository.SellerStoreRepository;
import AppDev.CampusMarketplace.Repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminDataController {

    private final UserRepository userRepository;
    private final SellerStoreRepository sellerStoreRepository;
    private final ProductRepository productRepository;
    private final SellerApplicationRepository sellerApplicationRepository;

    public AdminDataController(UserRepository userRepository,
                               SellerStoreRepository sellerStoreRepository,
                               ProductRepository productRepository, SellerApplicationRepository sellerApplicationRepository) {
        this.userRepository = userRepository;
        this.sellerStoreRepository = sellerStoreRepository;
        this.productRepository = productRepository;
        this.sellerApplicationRepository = sellerApplicationRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        List<AdminUserResponse> users = userRepository.findAll()
                .stream()
                .map(AdminUserResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/stores")
    public ResponseEntity<?> getStores() {
        List<AdminStoreResponse> stores = sellerStoreRepository.findAll()
                .stream()
                .map(store -> {
                    SellerApplication application = sellerApplicationRepository
                            .findByUserId(store.getUser().getId())
                            .orElse(null);
                    return AdminStoreResponse.fromEntity(store, application);
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(stores);
    }


    @PutMapping("/stores/{storeId}")
    public ResponseEntity<?> updateStore(@PathVariable Long storeId, @RequestBody AdminStoreUpdateRequest request) {
        SellerStore store = sellerStoreRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found."));

        if (request.getStoreName() != null && !request.getStoreName().isBlank()) {
            store.setStoreName(request.getStoreName());
        }
        if (request.getDescription() != null) {
            store.setDescription(request.getDescription());
        }

        SellerStore saved = sellerStoreRepository.save(store);
        SellerApplication application = sellerApplicationRepository
                .findByUserId(saved.getUser().getId())
                .orElse(null);

        return ResponseEntity.ok(AdminStoreResponse.fromEntity(saved, application));
    }

    @GetMapping("/products")
    public ResponseEntity<?> getProducts() {
        List<AdminProductResponse> products = productRepository.findAll()
                .stream()
                .map(AdminProductResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(products);
    }

    @PutMapping("/products/{productId}")
    public ResponseEntity<?> updateProduct(@PathVariable Long productId, @RequestBody AdminProductUpdateRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found."));

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
        return ResponseEntity.ok(AdminProductResponse.fromEntity(saved));
    }
}
