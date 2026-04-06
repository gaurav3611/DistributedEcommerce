package com.ecomm.distributed.ignite.service;

import com.ecomm.distributed.ignite.model.Cart;
import org.apache.hadoop.fs.FileSystem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;

@Service
public class CartService {
    @Autowired
    private FileSystem hdfs;

    @Value("${hdfs.base.path:/ecomm}")
    private String basePath;

    private HdfsStore<Cart> cartStore;

    @PostConstruct
    public void init() {
        cartStore = new HdfsStore<>(hdfs, basePath + "/carts", Cart.class);
    }

    public void addToCart(String cartId, String userId, String productId, int quantity) {
        Cart cart = cartStore.get(cartId);
        if (cart == null) {
            cart = new Cart(cartId, userId);
        }
        cart.addItem(productId, quantity);
        cartStore.put(cartId, cart);
    }

    public void removeFromCart(String cartId, String productId) {
        Cart cart = cartStore.get(cartId);
        if (cart != null) {
            cart.removeItem(productId);
            cartStore.put(cartId, cart);
        }
    }

    public Cart getCart(String cartId) {
        return cartStore.get(cartId);
    }
}
