package AppDev.CampusMarketplace.Controller;

import AppDev.CampusMarketplace.Entity.ProductStatus;
import AppDev.CampusMarketplace.Entity.SellerStore;
import AppDev.CampusMarketplace.Entity.StoreStatus;
import AppDev.CampusMarketplace.Model.ProductResponse;
import AppDev.CampusMarketplace.Model.ShopResponse;
import AppDev.CampusMarketplace.Repository.ProductRepository;
import AppDev.CampusMarketplace.Repository.SellerStoreRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/shops")
public class ShopController {

    private final SellerStoreRepository sellerStoreRepository;
    private final ProductRepository productRepository;

    public ShopController(SellerStoreRepository sellerStoreRepository, ProductRepository productRepository) {
        this.sellerStoreRepository = sellerStoreRepository;
        this.productRepository = productRepository;
    }

    @GetMapping
    public ResponseEntity<?> getShops() {
        List<SellerStore> stores = sellerStoreRepository.findAll()
                .stream()
                .filter(store -> store.getStatus() == null || store.getStatus() == StoreStatus.ACTIVE)
                .collect(Collectors.toList());

                Map<Long, Long> counts = productRepository.findAll()
                .stream()
                .filter(product -> product.getStatus() == null || product.getStatus() == ProductStatus.ACTIVE)
                                .filter(product -> {
                                        SellerStore store = product.getStore();
                                        if (store == null && product.getSeller() != null) {
                                                store = product.getSeller().getSellerStore();
                                        }
                                        return store != null && store.getId() != null;
                                })
                .collect(Collectors.groupingBy(
                                                product -> {
                                                        SellerStore store = product.getStore();
                                                        if (store == null && product.getSeller() != null) {
                                                                store = product.getSeller().getSellerStore();
                                                        }
                                                        return store.getId();
                                                },
                        Collectors.counting()
                ));

        List<ShopResponse> response = stores.stream()
                .map(store -> ShopResponse.fromEntity(store, counts.getOrDefault(store.getId(), 0L).intValue()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{shopId}")
    public ResponseEntity<?> getShop(@PathVariable Long shopId) {
        SellerStore store = sellerStoreRepository.findById(shopId).orElse(null);
        if (store == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Shop not found."));
        }

        long count = productRepository.findAll()
                .stream()
                .filter(product -> product.getStatus() == null || product.getStatus() == ProductStatus.ACTIVE)
                .filter(product -> {
                    SellerStore productStore = product.getStore();
                    if (productStore == null && product.getSeller() != null) {
                        productStore = product.getSeller().getSellerStore();
                    }
                    return productStore != null && shopId.equals(productStore.getId());
                })
                .count();

        return ResponseEntity.ok(ShopResponse.fromEntity(store, (int) count));
    }

    @GetMapping("/{shopId}/products")
    public ResponseEntity<?> getShopProducts(
            @PathVariable Long shopId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String search
    ) {
        SellerStore store = sellerStoreRepository.findById(shopId).orElse(null);
        if (store == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Shop not found."));
        }

        List<ProductResponse> products = productRepository.findAll()
                .stream()
                .filter(product -> product.getStatus() == null || product.getStatus() == ProductStatus.ACTIVE)
                .filter(product -> {
                    SellerStore productStore = product.getStore();
                    if (productStore == null && product.getSeller() != null) {
                        productStore = product.getSeller().getSellerStore();
                    }
                    return productStore != null && shopId.equals(productStore.getId());
                })
                .filter(product -> {
                    if (search == null || search.isBlank()) return true;
                    String needle = search.trim().toLowerCase();
                    String haystack = (product.getName() == null ? "" : product.getName())
                            + " " + (product.getDescription() == null ? "" : product.getDescription());
                    return haystack.toLowerCase().contains(needle);
                })
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());

        boolean usePaging = page != null || size != null;
        if (!usePaging) {
            return ResponseEntity.ok(products);
        }

        int pageValue = page != null && page >= 0 ? page : 0;
        int sizeValue = size != null && size > 0 ? size : 24;
        int total = products.size();
        int totalPages = sizeValue == 0 ? 0 : (int) Math.ceil(total / (double) sizeValue);
        int fromIndex = Math.min(pageValue * sizeValue, total);
        int toIndex = Math.min(fromIndex + sizeValue, total);
        List<ProductResponse> pageItems = products.subList(fromIndex, toIndex);

        return ResponseEntity.ok(Map.of(
                "products", pageItems,
                "page", pageValue,
                "size", sizeValue,
                "total", total,
                "totalPages", totalPages
        ));
    }
}
