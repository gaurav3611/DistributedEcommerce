package com.ecomm.distributed.ignite.service;

import org.apache.zookeeper.CreateMode;
import org.apache.zookeeper.KeeperException;
import org.apache.zookeeper.ZooDefs;
import org.apache.zookeeper.ZooKeeper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;

@Service
public class ZooKeeperService {

    private static final Logger logger = LoggerFactory.getLogger(ZooKeeperService.class);
    private static final String ECOMM_PARENT_NODE = "/ecomm-distributed";

    @Autowired
    private ZooKeeper zooKeeper;

    @PostConstruct
    public void initializeBaseNode() {
        try {
            if (zooKeeper.exists(ECOMM_PARENT_NODE, false) == null) {
                zooKeeper.create(ECOMM_PARENT_NODE, new byte[0], ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.PERSISTENT);
                logger.info("Created parent ZooKeeper Node: {}", ECOMM_PARENT_NODE);
            }
            // Automatically register this backend instance as a live child node
            String instanceId = java.util.UUID.randomUUID().toString().substring(0, 8);
            registerServiceNode(instanceId);
        } catch (KeeperException | InterruptedException e) {
            logger.error("Failed to initialize parent node", e);
        }
    }

    /**
     * Registers this microservice instance as an ephemeral node.
     * If the server crashes, ZooKeeper will automatically delete this node.
     */
    public void registerServiceNode(String instanceId) {
        String nodePath = ECOMM_PARENT_NODE + "/node-" + instanceId;
        try {
            zooKeeper.create(nodePath, "Active".getBytes(), ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.EPHEMERAL);
            logger.info("Registered ephemeral service node successfully at {}", nodePath);
        } catch (KeeperException | InterruptedException e) {
            logger.error("Error registering service node", e);
        }
    }
}
