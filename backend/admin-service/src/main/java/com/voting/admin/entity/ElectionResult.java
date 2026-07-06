package com.voting.admin.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "election_results")
public class ElectionResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "election_id", nullable = false, unique = true)
    private Long electionId;

    @Column(name = "election_title", nullable = false)
    private String electionTitle;

    @Column(name = "total_votes")
    private Long totalVotes = 0L;

    @Column(length = 20)
    private String status = "PENDING";

    @Column(name = "calculated_at")
    private LocalDateTime calculatedAt;

    public ElectionResult() {}

    public ElectionResult(Long electionId, String electionTitle) {
        this.electionId = electionId;
        this.electionTitle = electionTitle;
        this.totalVotes = 0L;
        this.status = "PENDING";
    }

    public Long getId() { return id; }
    public Long getElectionId() { return electionId; }
    public String getElectionTitle() { return electionTitle; }
    public Long getTotalVotes() { return totalVotes; }
    public void setTotalVotes(Long totalVotes) { this.totalVotes = totalVotes; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCalculatedAt() { return calculatedAt; }
    public void setCalculatedAt(LocalDateTime calculatedAt) { this.calculatedAt = calculatedAt; }
}
