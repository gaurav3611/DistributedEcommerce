package com.ecomm.distributed.ignite.service;

import com.ecomm.distributed.ignite.model.UserSession;
import org.apache.hadoop.fs.FileSystem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;

@Service
public class SessionService {
    @Autowired
    private FileSystem hdfs;

    @Value("${hdfs.base.path:/ecomm}")
    private String basePath;

    private HdfsStore<UserSession> sessionStore;

    @PostConstruct
    public void init() {
        sessionStore = new HdfsStore<>(hdfs, basePath + "/sessions", UserSession.class);
    }

    public void createSession(UserSession session) {
        sessionStore.put(session.getSessionId(), session);
    }

    public UserSession getSession(String sessionId) {
        return sessionStore.get(sessionId);
    }
}
