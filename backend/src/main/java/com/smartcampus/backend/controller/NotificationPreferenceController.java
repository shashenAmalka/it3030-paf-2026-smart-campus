package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.NotificationPreference;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.service.CurrentUserService;
import com.smartcampus.backend.service.NotificationPreferenceService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications/preferences")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationPreferenceController {

    @Autowired
    private NotificationPreferenceService service;

    @Autowired
    private CurrentUserService currentUserService;

    // GET /api/notifications/preferences
    // Get current user's notification preferences
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationPreference> getPreferences(
            @AuthenticationPrincipal OAuth2User principal,
            HttpServletRequest request) {
        User currentUser = currentUserService.resolveCurrentUser(principal, request);
        String userId = currentUser.getId();
        return ResponseEntity.ok(service.getOrCreate(userId));
    }

    // PUT /api/notifications/preferences
    // Update current user's notification preferences
    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationPreference> updatePreferences(
            @RequestBody NotificationPreference updateRequest,
            @AuthenticationPrincipal OAuth2User principal,
            HttpServletRequest request) {
        User currentUser = currentUserService.resolveCurrentUser(principal, request);
        String userId = currentUser.getId();
        return ResponseEntity.ok(service.update(userId, updateRequest));
    }
}
