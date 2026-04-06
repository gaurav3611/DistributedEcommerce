package com.ecomm.distributed.ignite.service;

import com.ecomm.distributed.ignite.model.Recommendation;
import org.apache.hadoop.fs.FileSystem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.Arrays;
import java.util.List;

@Service
public class RecommendationService {
    @Autowired
    private FileSystem hdfs;

    @Value("${hdfs.base.path:/ecomm}")
    private String basePath;

    private HdfsStore<Recommendation> recommendationStore;

    @PostConstruct
    public void init() {
        recommendationStore = new HdfsStore<>(hdfs, basePath + "/recommendations", Recommendation.class);
    }

    public Recommendation getRecommendations(String userId) {
        Recommendation rec = recommendationStore.get(userId);
        if (rec != null) {
            return rec;
        }

        // Simulating recommendation algorithm
        List<String> items = Arrays.asList("hadoop-mug", "mechanical-kb", "smart-watch");
        rec = new Recommendation(userId, items);
        recommendationStore.put(userId, rec);
        
        return rec;
    }
}
