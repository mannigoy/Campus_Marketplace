package AppDev.CampusMarketplace.Controller;

import AppDev.CampusMarketplace.Entity.Category;
import AppDev.CampusMarketplace.Model.CategoryCreateRequest;
import AppDev.CampusMarketplace.Model.CategoryResponse;
import AppDev.CampusMarketplace.Repository.CategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/categories")
public class AdminCategoryController {

    private final CategoryRepository categoryRepository;

    public AdminCategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public ResponseEntity<?> getCategories() {
        List<CategoryResponse> categories = categoryRepository.findAllByOrderByNameAsc()
                .stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }

    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody CategoryCreateRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Category name is required."));
        }
        String name = request.getName().trim();
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Category already exists."));
        }

        Category category = new Category();
        category.setName(name);
        category.setDescription(request.getDescription() != null && !request.getDescription().isBlank()
                ? request.getDescription().trim()
                : null);

        Category saved = categoryRepository.save(category);
        return ResponseEntity.ok(CategoryResponse.fromEntity(saved));
    }
}
