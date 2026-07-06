package com.voting.voting.event;

import java.time.LocalDateTime;

public class VoteEvent {

    private Long voteId;
    private Long userId;
    private Long electionId;
    private String electionTitle;
    private Long candidateId;
    private String candidateName;
    private String hash;
    private String previousHash;
    private LocalDateTime votedAt;

    public VoteEvent() {}

    public VoteEvent(Long voteId, Long userId, Long electionId, String electionTitle,
                     Long candidateId, String candidateName, String hash,
                     String previousHash, LocalDateTime votedAt) {
        this.voteId = voteId;
        this.userId = userId;
        this.electionId = electionId;
        this.electionTitle = electionTitle;
        this.candidateId = candidateId;
        this.candidateName = candidateName;
        this.hash = hash;
        this.previousHash = previousHash;
        this.votedAt = votedAt;
    }

    public Long getVoteId() { return voteId; }
    public Long getUserId() { return userId; }
    public Long getElectionId() { return electionId; }
    public String getElectionTitle() { return electionTitle; }
    public Long getCandidateId() { return candidateId; }
    public String getCandidateName() { return candidateName; }
    public String getHash() { return hash; }
    public String getPreviousHash() { return previousHash; }
    public LocalDateTime getVotedAt() { return votedAt; }
}
