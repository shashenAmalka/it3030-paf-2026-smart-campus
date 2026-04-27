package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.model.Role;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.ResourceRepository;
import com.smartcampus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class BookingNotificationService {

    private final TicketNotificationService notificationService;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;

    public void notifyCreated(Booking booking, User actor) {
        if (booking == null) {
            return;
        }

        String message = describeActor(actor, "requested") + " " + resolveFacilityLabel(booking) + describeSlot(booking) + ".";
        notifyAdminsExcept(actor == null ? null : actor.getId(), "New booking request", message, null);
    }

    public void notifyDecision(Booking booking, boolean approved, String adminNotes) {
        if (booking == null || booking.getUserId() == null || booking.getUserId().isBlank()) {
            return;
        }

        String facilityLabel = resolveFacilityLabel(booking);
        String slot = describeSlot(booking);
        String title = approved ? "Booking approved" : "Booking rejected";
        StringBuilder message = new StringBuilder();
        message.append("Your booking for ").append(facilityLabel).append(slot);

        if (approved) {
            message.append(" has been approved.");
        } else {
            message.append(" was rejected");
            String reason = normalize(adminNotes);
            if (reason != null) {
                message.append(": ").append(reason);
            } else {
                message.append('.');
            }
        }

        notificationService.notify(booking.getUserId(), "BOOKING", title, message.toString(), null);
    }

    public void notifyCheckIn(Booking booking, User actor) {
        if (booking == null) {
            return;
        }

        String facilityLabel = resolveFacilityLabel(booking);
        String message = facilityLabel + describeSlot(booking) + " was checked in successfully.";

        Set<String> recipientIds = new LinkedHashSet<>();
        addAdminsExcept(recipientIds, actor == null ? null : actor.getId());

        if (actor == null || actor.getRole() == Role.ADMIN) {
            addRecipient(recipientIds, booking.getUserId(), actor == null ? null : actor.getId());
        }

        notifyRecipients(recipientIds, "Booking checked in", message, null);
    }

    public void notifyAutoCancelled(Booking booking) {
        if (booking == null) {
            return;
        }

        String facilityLabel = resolveFacilityLabel(booking);
        String message = facilityLabel + describeSlot(booking)
                + " was auto-cancelled because no check-in was recorded within 15 minutes of the start time.";

        Set<String> recipientIds = new LinkedHashSet<>();
        addAdminsExcept(recipientIds, null);
        addRecipient(recipientIds, booking.getUserId(), null);

        notifyRecipients(recipientIds, "Booking auto-cancelled", message, null);
    }

    private void notifyAdminsExcept(String excludedUserId, String title, String message, String relatedBookingId) {
        Set<String> recipientIds = new LinkedHashSet<>();
        addAdminsExcept(recipientIds, excludedUserId);
        notifyRecipients(recipientIds, title, message, relatedBookingId);
    }

    private void addAdminsExcept(Set<String> recipientIds, String excludedUserId) {
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            addRecipient(recipientIds, admin == null ? null : admin.getId(), excludedUserId);
        }
    }

    private void addRecipient(Set<String> recipientIds, String userId, String excludedUserId) {
        if (userId == null || userId.isBlank()) {
            return;
        }
        if (excludedUserId != null && excludedUserId.equals(userId)) {
            return;
        }
        recipientIds.add(userId);
    }

    private void notifyRecipients(Set<String> recipientIds, String title, String message, String relatedBookingId) {
        if (recipientIds == null || recipientIds.isEmpty()) {
            return;
        }

        for (String recipientId : recipientIds) {
            notificationService.notify(recipientId, "BOOKING", title, message, relatedBookingId);
        }
    }

    private String resolveFacilityLabel(Booking booking) {
        if (booking == null) {
            return "booking";
        }

        String facilityId = booking.getFacilityId();
        if (facilityId == null || facilityId.isBlank()) {
            return "booking";
        }

        Resource facility = resourceRepository.findById(facilityId).orElse(null);
        return facility != null && facility.getName() != null && !facility.getName().isBlank()
                ? facility.getName()
                : facilityId;
    }

    private String describeSlot(Booking booking) {
        if (booking == null) {
            return "";
        }

        StringBuilder builder = new StringBuilder();
        if (booking.getDate() != null) {
            builder.append(" on ").append(booking.getDate());
        }
        if (booking.getStartTime() != null && booking.getEndTime() != null) {
            builder.append(" (")
                    .append(booking.getStartTime())
                    .append(" - ")
                    .append(booking.getEndTime())
                    .append(")");
        }
        return builder.toString();
    }

    private String describeActor(User actor, String action) {
        if (actor == null || actor.getName() == null || actor.getName().isBlank()) {
            return "A user " + action;
        }
        return actor.getName() + " " + action;
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}