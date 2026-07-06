package com.voting.admin.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "candidate_results", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"election_id", "candidate_id"})
})
public class CandidateResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "election_id", nullable = false)
    private Long electionId;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Column(name = "candidate_name", nullable = false)
    private String candidateName;

    @Column(length = 150)
    private String party;

    @Column(name = "vote_count")
    private Long voteCount = 0L;

    public CandidateResult() {}

    public CandidateResult(Long electionId, Long candidateId, String candidateName, String party) {
        this.electionId = electionId;
        this.candidateId = candidateId;
        this.candidateName = candidateName;
        this.party = party;
        this.voteCount = 0L;
    }

    public Long getId() { return id; }
    public Long getElectionId() { return electionId; }
    public Long getCandidateId() { return candidateId; }
    public String getCandidateName() { return candidateName; }
    public String getParty() { return party; }
    public Long getVoteCount() { return voteCount; }
    public void setVoteCount(Long voteCount) { this.voteCount = voteCount; }
    public void incrementVoteCount() { this.voteCount = (this.voteCount == null ? 0L : this.voteCount) + 1; }
}
