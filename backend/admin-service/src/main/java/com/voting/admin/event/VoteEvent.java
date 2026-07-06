package com.voting.admin.event;

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

    public Long getVoteId() { return voteId; }
    public Long getUserId() { return userId; }
    public Long getElectionId() { return electionId; }
    public Long getCandidateId() { return candidateId; }
    public String getHash() { return hash; }
    public String getPreviousHash() { return previousHash; }
    public LocalDateTime getVotedAt() { return votedAt; }
}
