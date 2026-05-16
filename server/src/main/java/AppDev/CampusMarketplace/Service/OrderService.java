package AppDev.CampusMarketplace.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import AppDev.CampusMarketplace.Entity.Cart;
import AppDev.CampusMarketplace.Entity.CartItem;
import AppDev.CampusMarketplace.Entity.CustomerOrder;
import AppDev.CampusMarketplace.Entity.CustomerOrderItem;
import AppDev.CampusMarketplace.Entity.OrderStatus;
import AppDev.CampusMarketplace.Entity.PaymentStatus;
import AppDev.CampusMarketplace.Entity.Product;
import AppDev.CampusMarketplace.Entity.User;
import AppDev.CampusMarketplace.Model.CheckoutRequest;
import AppDev.CampusMarketplace.Repository.CartItemRepository;
import AppDev.CampusMarketplace.Repository.CartRepository;
import AppDev.CampusMarketplace.Repository.CustomerOrderRepository;
import AppDev.CampusMarketplace.Repository.ProductRepository;

@Service
public class OrderService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CustomerOrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            CustomerOrderRepository orderRepository,
            ProductRepository productRepository
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public CustomerOrder checkout(User buyer, CheckoutRequest request) {
        validateCheckoutRequest(request);

        Cart cart = cartRepository.findByUser(buyer)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        List<CartItem> cartItems = cart.getItems();
        if (cartItems == null || cartItems.isEmpty()) {
            throw new RuntimeException("Your cart is empty");
        }

        Set<Long> selectedIds = request.getCartItemIds() == null
                ? new HashSet<>()
                : new HashSet<>(request.getCartItemIds());

        List<CartItem> selectedItems = cartItems.stream()
                .filter(item -> selectedIds.isEmpty() || selectedIds.contains(item.getId()))
                .collect(Collectors.toList());

        if (selectedItems.isEmpty()) {
            throw new RuntimeException("No cart items selected for checkout");
        }

        CustomerOrder order = new CustomerOrder();
        order.setBuyer(buyer);
        order.setCustomerName(request.getCustomerName().trim());
        order.setCustomerEmail(request.getCustomerEmail().trim());
        order.setContactNumber(request.getContactNumber().trim());
        order.setPickupDate(LocalDate.parse(request.getPickupDate()));
        order.setPickupTime(LocalTime.parse(request.getPickupTime()));
        order.setPickupLocation(request.getPickupLocation().trim());
        order.setPaymentMethod(request.getPaymentMethod().trim());
        order.setPaymentStatus(isPaidMethod(request.getPaymentMethod()) ? PaymentStatus.PAID : PaymentStatus.UNPAID);
        order.setOrderStatus(OrderStatus.PENDING);

        BigDecimal total = BigDecimal.ZERO;

        for (CartItem cartItem : selectedItems) {
            Product product = cartItem.getProduct();
            int quantity = cartItem.getQuantity() == null ? 1 : cartItem.getQuantity();
            int currentStock = product.getStockQuantity() == null ? 0 : product.getStockQuantity();

            if (currentStock < quantity) {
                throw new RuntimeException(product.getName() + " does not have enough stock");
            }

            BigDecimal unitPrice = product.getPrice() == null ? BigDecimal.ZERO : product.getPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));

            CustomerOrderItem orderItem = new CustomerOrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setProductName(product.getName());
            orderItem.setUnitPrice(unitPrice);
            orderItem.setQuantity(quantity);
            orderItem.setLineTotal(lineTotal);

            order.getItems().add(orderItem);
            total = total.add(lineTotal);

            product.setStockQuantity(currentStock - quantity);
            productRepository.save(product);
        }

        order.setTotalAmount(total);
        CustomerOrder savedOrder = orderRepository.save(order);

        cartItems.removeAll(selectedItems);
        cartItemRepository.deleteAll(selectedItems);
        cartRepository.save(cart);

        return savedOrder;
    }

    public List<CustomerOrder> getBuyerOrders(User buyer) {
        return orderRepository.findByBuyerOrderByCreatedAtDesc(buyer);
    }

    private boolean isPaidMethod(String paymentMethod) {
        return "GCash".equalsIgnoreCase(paymentMethod) || "Card".equalsIgnoreCase(paymentMethod);
    }

    private void validateCheckoutRequest(CheckoutRequest request) {
        if (request == null) {
            throw new RuntimeException("Missing checkout details");
        }
        if (isBlank(request.getCustomerName())) throw new RuntimeException("Customer name is required");
        if (isBlank(request.getCustomerEmail())) throw new RuntimeException("Customer email is required");
        if (isBlank(request.getContactNumber())) throw new RuntimeException("Contact number is required");
        if (isBlank(request.getPickupDate())) throw new RuntimeException("Pickup date is required");
        if (isBlank(request.getPickupTime())) throw new RuntimeException("Pickup time is required");
        if (isBlank(request.getPickupLocation())) throw new RuntimeException("Pickup location is required");
        if (isBlank(request.getPaymentMethod())) throw new RuntimeException("Payment method is required");
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
