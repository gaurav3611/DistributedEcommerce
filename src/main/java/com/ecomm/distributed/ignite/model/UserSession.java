package com.ecomm.distributed.ignite.model;

import java.io.Serializable;

public class UserSession implements Serializable {
    private String sessionId;
    private String userId;
    private long lastAccessTime;

    public UserSession(String sessionId, String userId, long lastAccessTime) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.lastAccessTime = lastAccessTime;
    }

    // Getters and Setters
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public long getLastAccessTime() { return lastAccessTime; }
    public void setLastAccessTime(long lastAccessTime) { this.lastAccessTime = lastAccessTime; }
}
