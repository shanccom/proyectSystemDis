package com.voting.voting.dto;

public class ElectionResultResponse {

    private Long candidateId;
    private Long votes;

    public ElectionResultResponse(
            Long candidateId,
            Long votes
    ) {
        this.candidateId = candidateId;
        this.votes = votes;
    }

    public Long getCandidateId() {
        return candidateId;
    }

    public Long getVotes() {
        return votes;
    }
}