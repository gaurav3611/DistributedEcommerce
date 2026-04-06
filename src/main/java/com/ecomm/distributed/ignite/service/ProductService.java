package com.ecomm.distributed.ignite.service;

import com.ecomm.distributed.ignite.model.Product;
import org.apache.hadoop.fs.FileSystem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.List;
import java.util.UUID;

@Service
public class ProductService {
    @Autowired
    private FileSystem hdfs;

    @Value("${hdfs.base.path:/ecomm}")
    private String basePath;

    private HdfsStore<Product> productStore;

    @PostConstruct
    public void init() {
        productStore = new HdfsStore<>(hdfs, basePath + "/products", Product.class);
        seedDefaultProducts();
    }

    private void seedDefaultProducts() {
        // Only seed if store is empty
        if (productStore.size() > 0) return;

        Product[] defaults = {
            new Product("hadoop-mug", "Apache Hadoop Mug", 1249, 1829,
                "/coffee_mug_product.png", "Accessories", 4.8, 312,
                "Best Seller", "#22d3ee",
                "Matte black ceramic with glowing circuit art. Perfect for long coding sessions.", 50, "system"),
            new Product("mac-book", "Developer Laptop Pro", 165999, 207499,
                "/macbook_laptop_product.png", "Hardware", 4.9, 892,
                "New", "#818cf8",
                "M3 Max, 128GB Unified RAM. Runs a full local Hadoop cluster with room to spare.", 15, "system"),
            new Product("mechanical-kb", "RGB Mechanical Keyboard", 12499, 16599,
                "/mechanical_keyboard_product.png", "Peripherals", 4.7, 543,
                "Hot Deal", "#f43f5e",
                "Tactile switches, per-key RGB, custom Hadoop theme pre-loaded from factory.", 100, "system"),
            new Product("smart-watch", "Cluster Monitor Watch", 24999, 33099,
                "/smart_watch_product.png", "Wearables", 4.6, 187,
                "Staff Pick", "#f97316",
                "Live JVM heap metrics, HDFS I/O alerts, and Hadoop node heartbeat on your wrist.", 30, "system"),
            new Product("rtx-gpu", "RTX 4090 Grid Unit", 132999, 157599,
                "/rtx_gpu_product.png", "Hardware", 4.9, 1201,
                "Limited", "#10b981",
                "Run GPU-accelerated ML recommendations directly inside your distributed compute nodes.", 8, "system"),
            new Product("server-rack", "Data Center Node Rack", 415000, 514600,
                "/server_rack_product.png", "Infrastructure", 4.5, 64,
                "Enterprise", "#a78bfa",
                "Houses 128 compute instances and 48TB of distributed HDFS block storage.", 3, "system"),
        };

        for (Product p : defaults) {
            productStore.put(p.getId(), p);
        }
    }

    public List<Product> getAllProducts() {
        return productStore.getAll();
    }

    public Product getProduct(String id) {
        return productStore.get(id);
    }

    public Product addProduct(Product product) {
        if (product.getId() == null || product.getId().isEmpty()) {
            product.setId(UUID.randomUUID().toString().substring(0, 8));
        }
        if (product.getRating() == 0) product.setRating(4.5);
        if (product.getColor() == null || product.getColor().isEmpty()) product.setColor("#f59e0b");
        productStore.put(product.getId(), product);
        return product;
    }

    public Product updateProduct(String id, Product product) {
        product.setId(id);
        productStore.put(id, product);
        return product;
    }

    public boolean deleteProduct(String id) {
        return productStore.delete(id);
    }

    public boolean decrementStock(String productId, int qty) {
        Product p = productStore.get(productId);
        if (p == null || p.getStock() < qty) return false;
        p.setStock(p.getStock() - qty);
        productStore.put(productId, p);
        return true;
    }

    public boolean updateStock(String productId, int newStock) {
        Product p = productStore.get(productId);
        if (p == null) return false;
        p.setStock(newStock);
        productStore.put(productId, p);
        return true;
    }
}
