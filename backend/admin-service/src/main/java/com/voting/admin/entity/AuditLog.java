package com.voting.admin.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @JdbcTypeCode(SqlTypes.JSON)
    private String payload;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    public AuditLog() {}

    public AuditLog(String eventType, String payload) {
        this.eventType = eventType;
        this.payload = payload;
        this.processedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getEventType() { return eventType; }
    public String getPayload() { return payload; }
    public LocalDateTime getProcessedAt() { return processedAt; }
}
