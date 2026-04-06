package com.ecomm.distributed.ignite.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.hadoop.fs.*;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Generic HDFS-backed key-value store.
 * Replaces all Apache Ignite caches with HDFS file operations.
 * Each entity is stored as a JSON file under its designated HDFS directory.
 *
 * Multi-node: Since HDFS replicates data automatically across DataNodes,
 * multiple Spring Boot instances on different machines can all access the same data.
 */
public class HdfsStore<T> {

    private final FileSystem fs;
    private final String basePath;
    private final Class<T> clazz;
    private final ObjectMapper mapper = new ObjectMapper();

    public HdfsStore(FileSystem fs, String basePath, Class<T> clazz) {
        this.fs = fs;
        this.basePath = basePath;
        this.clazz = clazz;
    }

    /**
     * Store an entity with the given key.
     */
    public void put(String key, T value) {
        Path path = new Path(basePath + "/" + sanitize(key) + ".json");
        try {
            String json = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(value);
            // Overwrite if exists
            try (FSDataOutputStream out = fs.create(path, true)) {
                out.write(json.getBytes(StandardCharsets.UTF_8));
                out.flush();
            }
        } catch (IOException e) {
            System.err.println("[HDFS Store] Failed to write " + key + ": " + e.getMessage());
        }
    }

    /**
     * Retrieve an entity by key. Returns null if not found.
     */
    public T get(String key) {
        Path path = new Path(basePath + "/" + sanitize(key) + ".json");
        try {
            if (!fs.exists(path)) return null;
            try (FSDataInputStream in = fs.open(path)) {
                return mapper.readValue((java.io.InputStream) in, clazz);
            }
        } catch (IOException e) {
            System.err.println("[HDFS Store] Failed to read " + key + ": " + e.getMessage());
            return null;
        }
    }

    /**
     * Delete an entity by key. Returns true if deleted.
     */
    public boolean delete(String key) {
        Path path = new Path(basePath + "/" + sanitize(key) + ".json");
        try {
            return fs.delete(path, false);
        } catch (IOException e) {
            System.err.println("[HDFS Store] Failed to delete " + key + ": " + e.getMessage());
            return false;
        }
    }

    /**
     * Check if an entity exists for the given key.
     */
    public boolean exists(String key) {
        Path path = new Path(basePath + "/" + sanitize(key) + ".json");
        try {
            return fs.exists(path);
        } catch (IOException e) {
            return false;
        }
    }

    /**
     * List all entities in the store.
     */
    public List<T> getAll() {
        List<T> results = new ArrayList<>();
        try {
            Path dir = new Path(basePath);
            if (!fs.exists(dir)) return results;

            FileStatus[] files = fs.listStatus(dir, path -> path.getName().endsWith(".json"));
            for (FileStatus file : files) {
                try (FSDataInputStream in = fs.open(file.getPath())) {
                    T item = mapper.readValue((java.io.InputStream) in, clazz);
                    results.add(item);
                } catch (IOException e) {
                    System.err.println("[HDFS Store] Failed to read file: " + file.getPath().getName());
                }
            }
        } catch (IOException e) {
            System.err.println("[HDFS Store] Failed to list: " + e.getMessage());
        }
        return results;
    }

    /**
     * Count all entities in the store.
     */
    public int size() {
        try {
            Path dir = new Path(basePath);
            if (!fs.exists(dir)) return 0;
            FileStatus[] files = fs.listStatus(dir, path -> path.getName().endsWith(".json"));
            return files.length;
        } catch (IOException e) {
            return 0;
        }
    }

    private String sanitize(String key) {
        // Replace characters that are invalid in HDFS filenames
        return key.replaceAll("[^a-zA-Z0-9_\\-]", "_");
    }
}
