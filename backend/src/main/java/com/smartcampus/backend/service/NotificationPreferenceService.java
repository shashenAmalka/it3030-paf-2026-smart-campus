package com.smartcampus.backend.service;

import com.smartcampus.backend.model.NotificationPreference;
import com.smartcampus.backend.repository.NotificationPreferenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Instant;

@Service
public class NotificationPreferenceService {

    @Autowired
    private NotificationPreferenceRepository repo;

    // Get preferences — create defaults if not exist
    public NotificationPreference getOrCreate(String userId) {
        return repo.findByUserId(userId).orElseGet(() -> {
            NotificationPreference pref = new NotificationPreference();
            pref.setUserId(userId);
            pref.setBookingUpdates(true);
            pref.setTicketUpdates(true);
            pref.setCommentAlerts(true);
            pref.setSlaWarnings(true);
            pref.setSystemAlerts(true);
            pref.setUpdatedAt(Instant.now());
            return repo.save(pref);
        });
    }

    // Update preferences
    public NotificationPreference update(String userId,
                                          NotificationPreference request) {
        NotificationPreference pref = getOrCreate(userId);
        pref.setBookingUpdates(request.isBookingUpdates());
        pref.setTicketUpdates(request.isTicketUpdates());
        pref.setCommentAlerts(request.isCommentAlerts());
        pref.setSlaWarnings(request.isSlaWarnings());
        pref.setSystemAlerts(request.isSystemAlerts());
        pref.setUpdatedAt(Instant.now());
        return repo.save(pref);
    }

    // Check if a specific notification type is enabled
    public boolean isEnabled(String userId, String notificationType) {
        NotificationPreference pref = getOrCreate(userId);
        return switch (notificationType) {
            case "BOOKING_APPROVED",
                 "BOOKING_REJECTED",
                 "BOOKING_CREATED"   -> pref.isBookingUpdates();
            case "TICKET_CREATED",
                 "TICKET_ASSIGNED",
                 "TICKET_RESOLVED",
                 "TICKET_CLOSED",
                 "STATUS_UPDATED"    -> pref.isTicketUpdates();
            case "NEW_COMMENT",
                 "COMMENT_ADDED"     -> pref.isCommentAlerts();
            case "SLA_BREACHED",
                 "SLA_AT_RISK"       -> pref.isSlaWarnings();
            default                  -> pref.isSystemAlerts();
        };
    }
}
