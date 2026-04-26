package com.smartcampus.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document(collection = "notification_preferences")
public class NotificationPreference {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private boolean bookingUpdates;
    private boolean ticketUpdates;
    private boolean commentAlerts;
    private boolean slaWarnings;
    private boolean systemAlerts;

    private Instant updatedAt;

    // Getters and Setters

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public boolean isBookingUpdates() { return bookingUpdates; }
    public void setBookingUpdates(boolean bookingUpdates) {
        this.bookingUpdates = bookingUpdates;
    }

    public boolean isTicketUpdates() { return ticketUpdates; }
    public void setTicketUpdates(boolean ticketUpdates) {
        this.ticketUpdates = ticketUpdates;
    }

    public boolean isCommentAlerts() { return commentAlerts; }
    public void setCommentAlerts(boolean commentAlerts) {
        this.commentAlerts = commentAlerts;
    }

    public boolean isSlaWarnings() { return slaWarnings; }
    public void setSlaWarnings(boolean slaWarnings) {
        this.slaWarnings = slaWarnings;
    }

    public boolean isSystemAlerts() { return systemAlerts; }
    public void setSystemAlerts(boolean systemAlerts) {
        this.systemAlerts = systemAlerts;
    }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
