package com.ecomm.distributed.ignite.service;

import com.ecomm.distributed.ignite.model.Order;
import com.ecomm.distributed.ignite.model.Product;
import org.apache.hadoop.fs.FileSystem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private FileSystem hdfs;

    @Value("${hdfs.base.path:/ecomm}")
    private String basePath;

    @Autowired
    private ProductService productService;

    private HdfsStore<Order> orderStore;

    @PostConstruct
    public void init() {
        orderStore = new HdfsStore<>(hdfs, basePath + "/orders", Order.class);
    }

    public Order createOrder(String username, Map<String, Integer> cartItems, String address, String paymentMethod, String paymentReference) {
        String orderId = "ORD-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);

        List<Order.OrderItem> items = new ArrayList<>();
        double total = 0;

        for (Map.Entry<String, Integer> entry : cartItems.entrySet()) {
            Product product = productService.getProduct(entry.getKey());
            if (product != null) {
                Order.OrderItem item = new Order.OrderItem(
                    product.getId(),
                    product.getName(),
                    product.getImage(),
                    product.getPrice(),
                    entry.getValue()
                );
                items.add(item);
                total += product.getPrice() * entry.getValue();
            }
        }

        Order order = new Order();
        order.setOrderId(orderId);
        order.setUsername(username);
        order.setItems(items);
        order.setTotal(total);
        order.setStatus("PLACED");
        order.setPlacedAt(System.currentTimeMillis());
        order.setShippingAddress(address != null ? address : "Default Address");
        order.setPaymentMethod(paymentMethod != null ? paymentMethod : "UPI");
        order.setPaymentReference(paymentReference);

        order.setStatus("PENDING_VERIFICATION");

        orderStore.put(orderId, order);

        return order;
    }

    public List<Order> getAllOrders() {
        return orderStore.getAll().stream()
                .sorted((a, b) -> Long.compare(b.getPlacedAt(), a.getPlacedAt()))
                .collect(Collectors.toList());
    }

    public void verifyAndConfirmOrder(String orderId) {
        Order order = orderStore.get(orderId);
        if (order != null && "PENDING_VERIFICATION".equals(order.getStatus())) {
            order.setStatus("CONFIRMED");
            order.setConfirmedAt(System.currentTimeMillis());
            orderStore.put(orderId, order);
            scheduleStatusProgression(orderId);
        }
    }

    public List<Order> getOrdersByUser(String username) {
        return orderStore.getAll().stream()
                .filter(order -> order.getUsername().equals(username))
                .sorted((a, b) -> Long.compare(b.getPlacedAt(), a.getPlacedAt()))
                .collect(Collectors.toList());
    }

    public Order getOrder(String orderId) {
        return orderStore.get(orderId);
    }

    private void scheduleStatusProgression(String orderId) {
        new Thread(() -> {
            try {
                // After 20 seconds → SHIPPED
                Thread.sleep(20000);
                updateStatus(orderId, "SHIPPED");

                // After 40 more seconds → OUT_FOR_DELIVERY
                Thread.sleep(40000);
                updateStatus(orderId, "OUT_FOR_DELIVERY");

                // After 60 more seconds → DELIVERED
                Thread.sleep(60000);
                updateStatus(orderId, "DELIVERED");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
    }

    private void updateStatus(String orderId, String status) {
        Order order = orderStore.get(orderId);
        if (order == null) return;

        order.setStatus(status);
        long now = System.currentTimeMillis();

        switch (status) {
            case "CONFIRMED": order.setConfirmedAt(now); break;
            case "SHIPPED": order.setShippedAt(now); break;
            case "OUT_FOR_DELIVERY": order.setOutForDeliveryAt(now); break;
            case "DELIVERED": order.setDeliveredAt(now); break;
        }

        orderStore.put(orderId, order);
    }
}
