package AppDev.CampusMarketplace.Controller;

import AppDev.CampusMarketplace.Entity.Category;
import AppDev.CampusMarketplace.Entity.ProductStatus;
import AppDev.CampusMarketplace.Model.CategoryResponse;
import AppDev.CampusMarketplace.Model.ProductResponse;
import AppDev.CampusMarketplace.Repository.CategoryRepository;
import AppDev.CampusMarketplace.Repository.ProductRepository;
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
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryController(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @GetMapping
    public ResponseEntity<?> getCategories() {
        List<CategoryResponse> categories = categoryRepository.findAllByOrderByNameAsc()
                .stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{categoryId}")
    public ResponseEntity<?> getCategory(@PathVariable Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElse(null);
        if (category == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Category not found."));
        }
        return ResponseEntity.ok(CategoryResponse.fromEntity(category));
    }

    @GetMapping("/{categoryId}/products")
    public ResponseEntity<?> getCategoryProducts(
            @PathVariable Long categoryId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String search
    ) {
        Category category = categoryRepository.findById(categoryId)
                .orElse(null);
        if (category == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Category not found."));
        }

        List<ProductResponse> products = productRepository.findAll()
                .stream()
                .filter(product -> product.getStatus() == null || product.getStatus() == ProductStatus.ACTIVE)
                .filter(product -> product.getCategory() != null
                        && product.getCategory().equalsIgnoreCase(category.getName()))
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
