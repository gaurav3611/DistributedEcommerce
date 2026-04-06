package com.ecomm.distributed.ignite.config;

import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PreDestroy;

/**
 * Hadoop HDFS Configuration for Distributed E-Commerce.
 *
 * This replaces the previous Apache Ignite in-memory grid with
 * Hadoop HDFS as the distributed storage layer.
 *
 * To connect two systems:
 *   - Set hdfs.namenode.url=hdfs://<NAMENODE_IP>:9000 in application.properties
 *   - Both systems run DataNodes that connect to the same NameNode
 *   - All data (products, users, carts, orders, sessions) is stored in HDFS
 */
@Configuration
public class HadoopConfig {

    @Value("${hdfs.namenode.url:hdfs://localhost:9000}")
    private String hdfsUrl;

    @Value("${hdfs.replication:2}")
    private int replication;

    @Value("${hdfs.base.path:/ecomm}")
    private String basePath;

    private FileSystem fileSystem;

    @Bean
    public org.apache.hadoop.conf.Configuration hadoopConfiguration() {
        org.apache.hadoop.conf.Configuration conf = new org.apache.hadoop.conf.Configuration();
        conf.set("fs.defaultFS", hdfsUrl);
        conf.set("dfs.replication", String.valueOf(replication));
        // Enable cross-platform support (important for macOS/Linux mixed clusters)
        conf.set("dfs.support.append", "true");
        conf.set("dfs.client.block.write.replace-datanode-on-failure.enable", "true");
        conf.set("dfs.client.block.write.replace-datanode-on-failure.policy", "NEVER");
        return conf;
    }

    @Bean
    public FileSystem hdfsFileSystem(org.apache.hadoop.conf.Configuration hadoopConfiguration) throws Exception {
        fileSystem = FileSystem.get(java.net.URI.create(hdfsUrl), hadoopConfiguration);

        // Create the base directories for our e-commerce data
        String[] dirs = {
            basePath + "/products",
            basePath + "/users",
            basePath + "/carts",
            basePath + "/orders",
            basePath + "/sessions",
            basePath + "/recommendations",
            basePath + "/transactions"  // legacy order logs
        };
        for (String dir : dirs) {
            Path p = new Path(dir);
            if (!fileSystem.exists(p)) {
                fileSystem.mkdirs(p);
                System.out.println("[Hadoop HDFS] Created directory: " + dir);
            }
        }

        System.out.println("╔══════════════════════════════════════════════════╗");
        System.out.println("║  Hadoop HDFS Connected: " + hdfsUrl);
        System.out.println("║  Replication Factor:    " + replication);
        System.out.println("║  Base Path:             " + basePath);
        System.out.println("╚══════════════════════════════════════════════════╝");

        return fileSystem;
    }

    @PreDestroy
    public void close() throws Exception {
        if (fileSystem != null) {
            fileSystem.close();
            System.out.println("[Hadoop HDFS] FileSystem closed.");
        }
    }
}
