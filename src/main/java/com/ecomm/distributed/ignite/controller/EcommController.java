package com.ecomm.distributed.ignite.controller;

import com.ecomm.distributed.ignite.model.*;
import com.ecomm.distributed.ignite.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class EcommController {

    @Autowired private SessionService sessionService;
    @Autowired private CartService cartService;
    @Autowired private RecommendationService recommendationService;
    @Autowired private ProductService productService;
    @Autowired private UserService userService;
    @Autowired private OrderService orderService;

    // ─── AUTH ────────────────────────────────────────────

    @PostMapping("/auth/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody AuthRequest req) {
        Map<String, Object> res = new HashMap<>();

        if (req.getUsername() == null || req.getUsername().trim().isEmpty()) {
            res.put("success", false);
            res.put("message", "Username is required");
            return ResponseEntity.badRequest().body(res);
        }
        if (req.getPassword() == null || req.getPassword().length() < 6) {
            res.put("success", false);
            res.put("message", "Password must be at least 6 characters");
            return ResponseEntity.badRequest().body(res);
        }
        if (req.getEmail() == null || !req.getEmail().contains("@")) {
            res.put("success", false);
            res.put("message", "Valid email is required");
            return ResponseEntity.badRequest().body(res);
        }

        String role = req.getRole() != null ? req.getRole() : "customer";
        User user = userService.register(req.getUsername().trim(), req.getEmail().trim(), req.getPassword(), role);

        if (user == null) {
            res.put("success", false);
            res.put("message", "Username already taken");
            return ResponseEntity.badRequest().body(res);
        }

        res.put("success", true);
        res.put("message", "Account created successfully");
        res.put("user", Map.of(
            "username", user.getUsername(),
            "email", user.getEmail(),
            "role", user.getRole()
        ));
        return ResponseEntity.ok(res);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody AuthRequest req) {
        Map<String, Object> res = new HashMap<>();

        if (req.getUsername() == null || req.getPassword() == null) {
            res.put("success", false);
            res.put("message", "Username and password are required");
            return ResponseEntity.badRequest().body(res);
        }

        User user = userService.authenticate(req.getUsername().trim(), req.getPassword());

        if (user == null) {
            res.put("success", false);
            res.put("message", "Invalid username or password");
            return ResponseEntity.status(401).body(res);
        }

        res.put("success", true);
        res.put("message", "Login successful");
        res.put("user", Map.of(
            "username", user.getUsername(),
            "email", user.getEmail(),
            "role", user.getRole()
        ));
        return ResponseEntity.ok(res);
    }

    // ─── CHECKOUT ────────────────────────────────────────

    @PostMapping("/checkout/{cartId}")
    public ResponseEntity<Map<String, Object>> checkout(@PathVariable String cartId,
            @RequestBody(required = false) CheckoutRequest request) throws Exception {
        Map<String, Object> res = new HashMap<>();
        Cart cart = cartService.getCart(cartId);
        if (cart == null || cart.getItems().isEmpty()) {
            res.put("success", false);
            res.put("message", "Cart is empty!");
            return ResponseEntity.badRequest().body(res);
        }

        for (Map.Entry<String, Integer> entry : cart.getItems().entrySet()) {
            boolean stockOk = productService.decrementStock(entry.getKey(), entry.getValue());
            if (!stockOk) {
                res.put("success", false);
                res.put("message", "Insufficient stock for product: " + entry.getKey());
                return ResponseEntity.badRequest().body(res);
            }
        }

        // Create tracked order
        String username = cart.getUserId();
        String address = "Default Address";
        try {
            if (request != null && request.getAddress() != null) {
                address = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(request.getAddress());
            }
        } catch (Exception e) {}
        String payment = request != null && request.getPaymentMethod() != null ? request.getPaymentMethod() : "UPI";
        String paymentRef = request != null ? request.getPaymentDetails() : null;
        Order order = orderService.createOrder(username, cart.getItems(), address, payment, paymentRef);

        // All orders are automatically processed into HDFS by OrderService now
        cart.getItems().clear();

        res.put("success", true);
        res.put("orderId", order.getOrderId());
        res.put("message", "Order placed successfully!");
        res.put("order", order);
        return ResponseEntity.ok(res);
    }

    // ─── ORDERS (Tracking) ───────────────────────────────

    @GetMapping("/orders/{username}")
    public List<Order> getUserOrders(@PathVariable String username) {
        return orderService.getOrdersByUser(username);
    }

    @GetMapping("/orders/track/{orderId}")
    public ResponseEntity<Order> trackOrder(@PathVariable String orderId) {
        Order order = orderService.getOrder(orderId);
        if (order == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(order);
    }

    // ─── SESSION ─────────────────────────────────────────

    @PostMapping("/session")
    public String createSession(@RequestBody UserSession session) {
        sessionService.createSession(session);
        return "Session created in distributed cache";
    }

    @GetMapping("/session/{sessionId}")
    public UserSession getSession(@PathVariable String sessionId) {
        return sessionService.getSession(sessionId);
    }

    // ─── CART ────────────────────────────────────────────

    @PostMapping("/cart/{cartId}/add")
    public String addToCart(@PathVariable String cartId, @RequestParam String userId,
            @RequestParam String productId, @RequestParam int quantity) {
        cartService.addToCart(cartId, userId, productId, quantity);
        return "Item added to shared cart";
    }

    @GetMapping("/cart/{cartId}")
    public Cart getCart(@PathVariable String cartId) {
        return cartService.getCart(cartId);
    }

    // ─── RECOMMENDATIONS ─────────────────────────────────

    @GetMapping("/recommendations/{userId}")
    public Recommendation getRecommendations(@PathVariable String userId) {
        return recommendationService.getRecommendations(userId);
    }

    // ─── PRODUCTS (Public) ───────────────────────────────

    @GetMapping("/products")
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable String id) {
        Product p = productService.getProduct(id);
        if (p == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(p);
    }

    // ─── PRODUCTS (Admin) ────────────────────────────────

    @PostMapping("/admin/products")
    public Product addProduct(@RequestBody Product product) {
        return productService.addProduct(product);
    }

    @PutMapping("/admin/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable String id, @RequestBody Product product) {
        Product existing = productService.getProduct(id);
        if (existing == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(productService.updateProduct(id, product));
    }

    @DeleteMapping("/admin/products/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable String id) {
        boolean deleted = productService.deleteProduct(id);
        if (!deleted) return ResponseEntity.notFound().build();
        return ResponseEntity.ok("Product deleted");
    }

    @PutMapping("/admin/products/{id}/stock")
    public ResponseEntity<String> updateStock(@PathVariable String id, @RequestParam int stock) {
        boolean ok = productService.updateStock(id, stock);
        if (!ok) return ResponseEntity.notFound().build();
        return ResponseEntity.ok("Stock updated to " + stock);
    }

    @GetMapping("/admin/orders")
    public List<Order> getAllOrdersAdmin() {
        return orderService.getAllOrders();
    }

    @PutMapping("/admin/orders/{orderId}/verify")
    public ResponseEntity<String> verifyOrder(@PathVariable String orderId) {
        orderService.verifyAndConfirmOrder(orderId);
        return ResponseEntity.ok("Order confirmed");
    }
}
