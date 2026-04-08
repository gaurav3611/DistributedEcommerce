package com.ecomm.distributed.ignite.service;

import org.apache.hadoop.fs.*;
import org.apache.hadoop.hdfs.DistributedFileSystem;
import org.apache.hadoop.hdfs.protocol.DatanodeInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Cluster Monitor Service — Demonstrates Distributed Shared Memory.
 *
 * This service queries the Hadoop HDFS cluster to provide real-time proof
 * that data is distributed and replicated across multiple physical systems.
 *
 * Key demo features:
 *   1. Lists all active DataNodes (proving two systems are connected)
 *   2. Shows where each file's data blocks are physically stored
 *   3. Displays replication factor and storage usage per node
 *   4. Tracks every operation with real-time file counts
 */
@Service
public class ClusterMonitorService {

    @Autowired
    private FileSystem hdfs;

    @Value("${hdfs.base.path:/ecomm}")
    private String basePath;

    /**
     * Gets a full cluster health report — the main demo endpoint.
     */
    public Map<String, Object> getClusterHealth() {
        Map<String, Object> health = new LinkedHashMap<>();

        health.put("timestamp", System.currentTimeMillis());
        health.put("timestampReadable", new Date().toString());
        health.put("hdfsUri", hdfs.getUri().toString());

        // 1. DataNode information (proves two systems are connected)
        health.put("dataNodes", getDataNodeInfo());

        // 2. Storage summary per directory
        health.put("storageSummary", getStorageSummary());

        // 3. File distribution map (proves data is on both nodes)
        health.put("fileDistribution", getFileDistribution());

        // 4. Replication health
        health.put("replicationHealth", getReplicationHealth());

        return health;
    }

    /**
     * Lists all active DataNodes in the cluster.
     * This is the KEY proof that two systems are working together.
     */
    public List<Map<String, Object>> getDataNodeInfo() {
        List<Map<String, Object>> nodes = new ArrayList<>();
        try {
            if (hdfs instanceof DistributedFileSystem) {
                DistributedFileSystem dfs = (DistributedFileSystem) hdfs;
                DatanodeInfo[] dataNodes = dfs.getDataNodeStats();

                for (DatanodeInfo dn : dataNodes) {
                    Map<String, Object> node = new LinkedHashMap<>();
                    node.put("hostname", dn.getHostName());
                    node.put("ipAddress", dn.getIpAddr());
                    node.put("port", dn.getXferPort());
                    node.put("state", dn.getAdminState().toString());
                    node.put("capacityTotal", formatBytes(dn.getCapacity()));
                    node.put("capacityTotalBytes", dn.getCapacity());
                    node.put("capacityUsed", formatBytes(dn.getDfsUsed()));
                    node.put("capacityUsedBytes", dn.getDfsUsed());
                    node.put("capacityRemaining", formatBytes(dn.getRemaining()));
                    node.put("capacityRemainingBytes", dn.getRemaining());
                    node.put("usagePercent", String.format("%.2f%%",
                        (dn.getDfsUsed() * 100.0) / Math.max(dn.getCapacity(), 1)));
                    node.put("lastContact", dn.getLastUpdate());
                    node.put("blocksCount", dn.getNumBlocks());
                    nodes.add(node);
                }
            }
        } catch (IOException e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("error", "Cannot fetch DataNode info: " + e.getMessage());
            nodes.add(error);
        }
        return nodes;
    }

    /**
     * Shows file count and size per e-commerce data category.
     */
    public Map<String, Object> getStorageSummary() {
        Map<String, Object> summary = new LinkedHashMap<>();
        String[] categories = {"products", "users", "carts", "orders", "sessions", "recommendations", "transactions"};

        int totalFiles = 0;
        long totalSize = 0;

        for (String category : categories) {
            try {
                Path dirPath = new Path(basePath + "/" + category);
                if (hdfs.exists(dirPath)) {
                    ContentSummary cs = hdfs.getContentSummary(dirPath);
                    Map<String, Object> catInfo = new LinkedHashMap<>();
                    catInfo.put("fileCount", cs.getFileCount());
                    catInfo.put("totalSize", formatBytes(cs.getLength()));
                    catInfo.put("totalSizeBytes", cs.getLength());
                    catInfo.put("spaceConsumed", formatBytes(cs.getSpaceConsumed()));
                    catInfo.put("spaceConsumedBytes", cs.getSpaceConsumed());
                    // spaceConsumed = size × replication factor (proves replication!)
                    long replicationProof = cs.getLength() > 0
                        ? cs.getSpaceConsumed() / cs.getLength() : 0;
                    catInfo.put("effectiveReplication", replicationProof);
                    summary.put(category, catInfo);

                    totalFiles += cs.getFileCount();
                    totalSize += cs.getLength();
                }
            } catch (IOException e) {
                summary.put(category, Map.of("error", e.getMessage()));
            }
        }

        summary.put("_totalFiles", totalFiles);
        summary.put("_totalSize", formatBytes(totalSize));
        summary.put("_totalSizeBytes", totalSize);

        return summary;
    }

    /**
     * For each file in HDFS, shows WHICH DataNodes hold its data blocks.
     * This is the STRONGEST proof of distributed storage —
     * you can see the same file's blocks on System A and System B.
     */
    public List<Map<String, Object>> getFileDistribution() {
        List<Map<String, Object>> distribution = new ArrayList<>();
        String[] categories = {"products", "users", "orders"};  // Key categories for demo

        for (String category : categories) {
            try {
                Path dirPath = new Path(basePath + "/" + category);
                if (!hdfs.exists(dirPath)) continue;

                FileStatus[] files = hdfs.listStatus(dirPath,
                    path -> path.getName().endsWith(".json"));

                for (FileStatus file : files) {
                    Map<String, Object> fileInfo = new LinkedHashMap<>();
                    fileInfo.put("fileName", file.getPath().getName());
                    fileInfo.put("category", category);
                    fileInfo.put("size", formatBytes(file.getLen()));
                    fileInfo.put("sizeBytes", file.getLen());
                    fileInfo.put("replication", file.getReplication());
                    fileInfo.put("modificationTime", new Date(file.getModificationTime()).toString());

                    // Get block locations — this shows WHICH nodes hold this data
                    BlockLocation[] blocks = hdfs.getFileBlockLocations(file, 0, file.getLen());
                    List<Map<String, Object>> blockDetails = new ArrayList<>();
                    for (BlockLocation block : blocks) {
                        Map<String, Object> blockInfo = new LinkedHashMap<>();
                        blockInfo.put("offset", block.getOffset());
                        blockInfo.put("length", block.getLength());
                        blockInfo.put("hosts", Arrays.asList(block.getHosts()));
                        blockInfo.put("names", Arrays.asList(block.getNames()));
                        // cachedHosts shows which nodes have this block in memory
                        blockInfo.put("cachedHosts", Arrays.asList(block.getCachedHosts()));
                        blockDetails.add(blockInfo);
                    }
                    fileInfo.put("blockLocations", blockDetails);

                    // Collect all unique hosts that hold this file
                    Set<String> allHosts = new HashSet<>();
                    for (BlockLocation block : blocks) {
                        allHosts.addAll(Arrays.asList(block.getHosts()));
                    }
                    fileInfo.put("storedOnNodes", new ArrayList<>(allHosts));
                    fileInfo.put("nodeCount", allHosts.size());

                    distribution.add(fileInfo);
                }
            } catch (IOException e) {
                distribution.add(Map.of("category", category, "error", e.getMessage()));
            }
        }
        return distribution;
    }

    /**
     * Overall replication health check.
     */
    public Map<String, Object> getReplicationHealth() {
        Map<String, Object> health = new LinkedHashMap<>();
        try {
            if (hdfs instanceof DistributedFileSystem) {
                DistributedFileSystem dfs = (DistributedFileSystem) hdfs;
                DatanodeInfo[] dataNodes = dfs.getDataNodeStats();
                health.put("activeDataNodes", dataNodes.length);
                health.put("configuredReplication", hdfs.getDefaultReplication(new Path(basePath)));

                long totalCapacity = 0, totalUsed = 0;
                for (DatanodeInfo dn : dataNodes) {
                    totalCapacity += dn.getCapacity();
                    totalUsed += dn.getDfsUsed();
                }
                health.put("clusterCapacity", formatBytes(totalCapacity));
                health.put("clusterUsed", formatBytes(totalUsed));
                health.put("clusterUsagePercent", String.format("%.2f%%",
                    (totalUsed * 100.0) / Math.max(totalCapacity, 1)));

                // Check if replication is healthy
                boolean isHealthy = dataNodes.length >= hdfs.getDefaultReplication(new Path(basePath));
                health.put("isHealthy", isHealthy);
                health.put("status", isHealthy
                    ? "✅ HEALTHY — All data is fully replicated across " + dataNodes.length + " nodes"
                    : "⚠️ UNDER-REPLICATED — Need " + hdfs.getDefaultReplication(new Path(basePath))
                        + " DataNodes but only " + dataNodes.length + " are active");
            }
        } catch (IOException e) {
            health.put("error", e.getMessage());
        }
        return health;
    }

    /**
     * Logs the latest operations across all categories (for showing real-time activity).
     */
    public List<Map<String, Object>> getRecentActivity(int limit) {
        List<Map<String, Object>> activities = new ArrayList<>();
        String[] categories = {"products", "users", "carts", "orders", "sessions"};

        for (String category : categories) {
            try {
                Path dirPath = new Path(basePath + "/" + category);
                if (!hdfs.exists(dirPath)) continue;

                FileStatus[] files = hdfs.listStatus(dirPath);
                for (FileStatus file : files) {
                    Map<String, Object> activity = new LinkedHashMap<>();
                    activity.put("file", file.getPath().getName());
                    activity.put("category", category);
                    activity.put("size", formatBytes(file.getLen()));
                    activity.put("modifiedAt", file.getModificationTime());
                    activity.put("modifiedAtReadable", new Date(file.getModificationTime()).toString());
                    activity.put("replication", file.getReplication());
                    activity.put("owner", file.getOwner());
                    activities.add(activity);
                }
            } catch (IOException e) {
                // skip
            }
        }

        // Sort by most recent modification
        activities.sort((a, b) -> Long.compare(
            (long) b.get("modifiedAt"), (long) a.get("modifiedAt")));

        return activities.stream().limit(limit).collect(Collectors.toList());
    }

    private String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024));
        return String.format("%.2f GB", bytes / (1024.0 * 1024 * 1024));
    }
}
