package com.ecomm.distributed.ignite.model;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

public class Order implements Serializable {
    private String orderId;
    private String username;
    private List<OrderItem> items;
    private double total;
    private String status;          // PLACED, CONFIRMED, SHIPPED, OUT_FOR_DELIVERY, DELIVERED
    private long placedAt;
    private long confirmedAt;
    private long shippedAt;
    private long outForDeliveryAt;
    private long deliveredAt;
    private String shippingAddress;
    private String paymentMethod;
    private String paymentReference;

    public Order() {}

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public long getPlacedAt() { return placedAt; }
    public void setPlacedAt(long placedAt) { this.placedAt = placedAt; }
    public long getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(long confirmedAt) { this.confirmedAt = confirmedAt; }
    public long getShippedAt() { return shippedAt; }
    public void setShippedAt(long shippedAt) { this.shippedAt = shippedAt; }
    public long getOutForDeliveryAt() { return outForDeliveryAt; }
    public void setOutForDeliveryAt(long outForDeliveryAt) { this.outForDeliveryAt = outForDeliveryAt; }
    public long getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(long deliveredAt) { this.deliveredAt = deliveredAt; }
    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }

    public static class OrderItem implements Serializable {
        private String productId;
        private String productName;
        private String productImage;
        private double price;
        private int quantity;

        public OrderItem() {}

        public OrderItem(String productId, String productName, String productImage, double price, int quantity) {
            this.productId = productId;
            this.productName = productName;
            this.productImage = productImage;
            this.price = price;
            this.quantity = quantity;
        }

        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        public String getProductImage() { return productImage; }
        public void setProductImage(String productImage) { this.productImage = productImage; }
        public double getPrice() { return price; }
        public void setPrice(double price) { this.price = price; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }
}
