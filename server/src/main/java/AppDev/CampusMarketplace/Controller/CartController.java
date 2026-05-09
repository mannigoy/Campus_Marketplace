package AppDev.CampusMarketplace.Controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import AppDev.CampusMarketplace.Entity.User;
import AppDev.CampusMarketplace.Repository.UserRepository;
import AppDev.CampusMarketplace.Service.CartService;
import AppDev.CampusMarketplace.Service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public CartController(
            CartService cartService,
            JwtService jwtService,
            UserRepository userRepository
    ) {
        this.cartService = cartService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    // GET CURRENT USER FROM TOKEN
    private User getUserFromToken(String token) {
        String email = jwtService.extractEmail(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ADD TO CART
    @PostMapping("/add")
    public ResponseEntity<?> addToCart(
            @RequestHeader("Authorization") String authHeader, // Use Header instead of Principal
            @RequestBody Map<String, Object> body
    ) {
        
        String token = authHeader.replace("Bearer ", "");
        
        
        User user = getUserFromToken(token);
        
        
        if (!body.containsKey("productId")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing productId"));
        }
        
        Long productId = Long.valueOf(body.get("productId").toString());
        
        
        cartService.addToCart(user.getId(), productId);

        return ResponseEntity.ok(Map.of("message", "Added to cart successfully"));
    }

    // GET CART
    @GetMapping
    public ResponseEntity<?> getCart(
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.replace("Bearer ", "");

        User user = getUserFromToken(token);

        return ResponseEntity.ok(cartService.getUserCart(user.getId()));
    }

    // REMOVE ONE ITEM
    @PostMapping("/remove")
    public ResponseEntity<?> removeItem(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Long> body
    ) {
        String token = authHeader.replace("Bearer ", "");

        User user = getUserFromToken(token);

        Long productId = Long.valueOf(body.get("productId").toString());    

        cartService.removeOne(user.getId(), productId);

        return ResponseEntity.ok(Map.of("message", "Item removed"));
    }

    // CLEAR CART
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.replace("Bearer ", "");

        User user = getUserFromToken(token);

        cartService.clearCart(user.getId());

        return ResponseEntity.ok(Map.of("message", "Cart cleared"));
    }
}