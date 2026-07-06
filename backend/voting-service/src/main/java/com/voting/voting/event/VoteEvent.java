package com.voting.voting.event;

import java.time.LocalDateTime;

public class VoteEvent {

    private Long voteId;
    private Long userId;
    private Long electionId;
    private Long candidateId;
    private String hash;
    private String previousHash;
    private LocalDateTime votedAt;

    public VoteEvent() {}

    public VoteEvent(Long voteId, Long userId, Long electionId,
                     Long candidateId, String hash,
                     String previousHash, LocalDateTime votedAt) {
        this.voteId = voteId;
        this.userId = userId;
        this.electionId = electionId;
        this.candidateId = candidateId;
        this.hash = hash;
        this.previousHash = previousHash;
        this.votedAt = votedAt;
    }

    public Long getVoteId() { return voteId; }
    public Long getUserId() { return userId; }
    public Long getElectionId() { return electionId; }
    public Long getCandidateId() { return candidateId; }
    public String getHash() { return hash; }
    public String getPreviousHash() { return previousHash; }
    public LocalDateTime getVotedAt() { return votedAt; }
}
