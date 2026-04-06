package com.ecomm.distributed.ignite.model;

import java.io.Serializable;
import java.util.List;

public class Recommendation implements Serializable {
    private String userId;
    private List<String> recommendedProductIds;

    public Recommendation() {}

    public Recommendation(String userId, List<String> recommendedProductIds) {
        this.userId = userId;
        this.recommendedProductIds = recommendedProductIds;
    }

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public List<String> getRecommendedProductIds() { return recommendedProductIds; }
    public void setRecommendedProductIds(List<String> recommendedProductIds) { this.recommendedProductIds = recommendedProductIds; }
}
