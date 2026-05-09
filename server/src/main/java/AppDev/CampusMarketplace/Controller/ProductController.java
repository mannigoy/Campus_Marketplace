package AppDev.CampusMarketplace.Controller;

import AppDev.CampusMarketplace.Entity.ProductStatus;
import AppDev.CampusMarketplace.Model.ProductResponse;
import AppDev.CampusMarketplace.Repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAllProducts() {
        List<ProductResponse> products = productRepository.findAll()
            .stream()
            .filter(product -> product.getStatus() == null || product.getStatus() == ProductStatus.ACTIVE)
            .map(ProductResponse::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(products);
    }
}
