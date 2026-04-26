package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.LoginAuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LoginAuditRepository
        extends MongoRepository<LoginAuditLog, String> {

    List<LoginAuditLog> findTop20ByOrderByTimestampDesc();

    long countByStatusAndTimestampAfter(
        String status, java.time.Instant after);

    long countByTimestampAfter(java.time.Instant after);
}
