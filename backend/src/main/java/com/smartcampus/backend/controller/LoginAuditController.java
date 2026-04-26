package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.LoginAuditLog;
import com.smartcampus.backend.service.LoginAuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/security")
@CrossOrigin(origins = "http://localhost:5173")
public class LoginAuditController {

    @Autowired
    private LoginAuditService auditService;

    // GET /api/admin/security/login-activity
    // Get recent login activity — Admin only
    @GetMapping("/login-activity")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LoginAuditLog>> getLoginActivity() {
        return ResponseEntity.ok(auditService.getRecentLogs());
    }

    // GET /api/admin/security/stats
    // Get today's login stats — Admin only
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(auditService.getTodayStats());
    }
}
