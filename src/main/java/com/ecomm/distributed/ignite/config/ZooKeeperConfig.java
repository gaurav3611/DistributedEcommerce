package com.ecomm.distributed.ignite.config;

import org.apache.zookeeper.Watcher;
import org.apache.zookeeper.ZooKeeper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.util.concurrent.CountDownLatch;

@Configuration
public class ZooKeeperConfig {

    private static final Logger logger = LoggerFactory.getLogger(ZooKeeperConfig.class);

    @Value("${zookeeper.address:localhost:2181}")
    private String zookeeperAddress;

    @Value("${zookeeper.timeout:5000}")
    private int sessionTimeout;

    @Bean
    public ZooKeeper zooKeeper() {
        try {
            CountDownLatch connectedSignal = new CountDownLatch(1);
            ZooKeeper zk = new ZooKeeper(zookeeperAddress, sessionTimeout, event -> {
                if (event.getState() == Watcher.Event.KeeperState.SyncConnected) {
                    connectedSignal.countDown();
                }
            });
            connectedSignal.await();
            logger.info("Successfully connected to Apache ZooKeeper at {}", zookeeperAddress);
            return zk;
        } catch (IOException | InterruptedException e) {
            logger.error("Failed to connect to ZooKeeper", e);
            throw new RuntimeException("Could not connect to ZooKeeper", e);
        }
    }
}
