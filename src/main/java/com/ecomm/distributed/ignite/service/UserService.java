package com.ecomm.distributed.ignite.service;

import com.ecomm.distributed.ignite.model.User;
import org.apache.hadoop.fs.FileSystem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
public class UserService {

    @Autowired
    private FileSystem hdfs;

    @Value("${hdfs.base.path:/ecomm}")
    private String basePath;

    private HdfsStore<User> userStore;

    @PostConstruct
    public void init() {
        userStore = new HdfsStore<>(hdfs, basePath + "/users", User.class);
    }

    public User register(String username, String email, String password, String role) {
        if (userStore.exists(username)) {
            return null;
        }

        String hash = hashPassword(password);
        User user = new User(username, email, hash, role);
        userStore.put(username, user);

        return user;
    }

    public User authenticate(String username, String password) {
        User user = userStore.get(username);
        if (user == null) return null;

        String hash = hashPassword(password);
        if (!hash.equals(user.getPasswordHash())) return null;

        return user;
    }

    public boolean userExists(String username) {
        return userStore.exists(username);
    }

    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String salted = "HadoopCommerce_SALT_" + password;
            byte[] hash = digest.digest(salted.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to hash password", e);
        }
    }
}
