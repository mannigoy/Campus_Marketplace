package AppDev.CampusMarketplace.Service;

import AppDev.CampusMarketplace.Entity.*;
import AppDev.CampusMarketplace.Repository.*;
import org.springframework.stereotype.Service;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CartService {
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;

    public CartService(
            CartItemRepository cartItemRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            CartRepository cartRepository
    ) {
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.cartRepository = cartRepository;
    }

    @Transactional
    public void addToCart(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // FIX: Use findByUser instead of findById
        Cart cart = cartRepository.findByUser(user).orElse(null);

        if (cart == null) {
            cart = new Cart();
            cart.setUser(user);
            // This ensures the Cart gets an ID from MySQL before the Item is saved
            cart = cartRepository.saveAndFlush(cart); 
        }

        CartItem cartItem = cartItemRepository.findByCartAndProduct(cart, product).orElse(null);

        if (cartItem != null) {
            cartItem.setQuantity(cartItem.getQuantity() + 1);
        } else {
            cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setUser(user); 
            cartItem.setQuantity(1);
        }
        cartItemRepository.save(cartItem);
    }

    public List<CartItem> getUserCart(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        // FIX: Use findByUser
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        return cart.getItems();
    }

    public void removeOne(Long userId, Long productId) {
        User user = userRepository.findById(userId).orElseThrow();
        // CHANGE: Use findByUser
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        
        Product product = productRepository.findById(productId).orElseThrow();

        CartItem cartItem = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new RuntimeException("Item not in cart"));

        int qty = cartItem.getQuantity() - 1;
        if (qty <= 0) {
            cartItemRepository.delete(cartItem);
        } else {
            cartItem.setQuantity(qty);
            cartItemRepository.save(cartItem);
        }
    }

    public void clearCart(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        // CHANGE: Use findByUser
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
                
        cart.getItems().clear(); 
        cartRepository.save(cart);
    }
}