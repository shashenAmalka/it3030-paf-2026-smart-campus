package com.smartcampus.backend.service;

import com.smartcampus.backend.model.LoginAuditLog;
import com.smartcampus.backend.repository.LoginAuditRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LoginAuditService {

    @Autowired
    private LoginAuditRepository repo;

    // Log successful login
    public void logSuccess(String userId, String fullName,
                            String email, String role,
                            String method, String ip) {
        LoginAuditLog log = new LoginAuditLog();
        log.setUserId(userId);
        log.setFullName(fullName);
        log.setEmail(email);
        log.setRole(role);
        log.setLoginMethod(method);
        log.setStatus("SUCCESS");
        log.setIpAddress(ip);
        log.setTimestamp(Instant.now());
        repo.save(log);
    }

    // Log failed login
    public void logFailed(String email, String reason, String ip) {
        LoginAuditLog log = new LoginAuditLog();
        log.setEmail(email);
        log.setStatus("FAILED");
        log.setFailureReason(reason);
        log.setIpAddress(ip);
        log.setTimestamp(Instant.now());
        repo.save(log);
    }

    // Get recent logs
    public List<LoginAuditLog> getRecentLogs() {
        return repo.findTop20ByOrderByTimestampDesc();
    }

    // Get today's stats
    public Map<String, Long> getTodayStats() {
        java.time.Instant startOfDay = java.time.Instant.now().truncatedTo(java.time.temporal.ChronoUnit.DAYS);
        List<LoginAuditLog> todayLogs = repo.findAll().stream()
                .filter(log -> log.getTimestamp().isAfter(startOfDay))
                .toList();

        long total = todayLogs.size();
        long failed = todayLogs.stream().filter(l -> "FAILED".equals(l.getStatus())).count();
        long unique = todayLogs.stream()
                .filter(l -> "SUCCESS".equals(l.getStatus()))
                .map(l -> l.getUserId())
                .filter(java.util.Objects::nonNull)
                .distinct()
                .count();

        Map<String, Long> stats = new HashMap<>();
        stats.put("totalLogins", total);
        stats.put("failedAttempts", failed);
        stats.put("successLogins", total - failed);
        stats.put("uniqueUsers", unique);
        return stats;
    }
}
