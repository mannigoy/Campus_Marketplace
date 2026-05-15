package AppDev.CampusMarketplace.Controller;

import AppDev.CampusMarketplace.Entity.Category;
import AppDev.CampusMarketplace.Entity.ProductStatus;
import AppDev.CampusMarketplace.Model.ProductResponse;
import AppDev.CampusMarketplace.Repository.CategoryRepository;
import AppDev.CampusMarketplace.Repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductController(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAllProducts(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long shopId,
            @RequestParam(required = false) String sort
    ) {
        Category filterCategory = null;
        if (categoryId != null) {
            filterCategory = categoryRepository.findById(categoryId).orElse(null);
            if (filterCategory == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Category not found."));
            }
        }

        Category finalFilterCategory = filterCategory;
        List<ProductResponse> products = productRepository.findAll()
                .stream()
                .filter(product -> product.getStatus() == null || product.getStatus() == ProductStatus.ACTIVE)
                .filter(product -> {
                    if (shopId == null) return true;
                    if (product.getSeller() == null || product.getSeller().getSellerStore() == null) return false;
                    return shopId.equals(product.getSeller().getSellerStore().getId());
                })
                .filter(product -> {
                    if (finalFilterCategory == null) return true;
                    if (product.getCategory() == null) return false;
                    return product.getCategory().equalsIgnoreCase(finalFilterCategory.getName());
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

        if (sort != null && !sort.isBlank()) {
            String sortKey = sort.trim().toLowerCase();
            switch (sortKey) {
                case "price_asc" -> products.sort((a, b) -> a.getPrice() == null
                        ? 1
                        : b.getPrice() == null
                        ? -1
                        : a.getPrice().compareTo(b.getPrice()));
                case "price_desc" -> products.sort((a, b) -> b.getPrice() == null
                        ? 1
                        : a.getPrice() == null
                        ? -1
                        : b.getPrice().compareTo(a.getPrice()));
                case "name_desc" -> products.sort((a, b) -> {
                    String left = a.getName() == null ? "" : a.getName();
                    String right = b.getName() == null ? "" : b.getName();
                    return right.compareToIgnoreCase(left);
                });
                case "name_asc" -> products.sort((a, b) -> {
                    String left = a.getName() == null ? "" : a.getName();
                    String right = b.getName() == null ? "" : b.getName();
                    return left.compareToIgnoreCase(right);
                });
                default -> {
                }
            }
        }

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
