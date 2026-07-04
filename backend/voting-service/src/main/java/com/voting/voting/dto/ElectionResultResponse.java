package com.voting.voting.dto;

public class ElectionResultResponse {

    private Long candidateId;
    private String candidateName;
    private Long votes;

    public ElectionResultResponse(
            Long candidateId,
            String candidateName,
            Long votes
    ) {
        this.candidateId = candidateId;
        this.candidateName = candidateName;
        this.votes = votes;
    }

    public Long getCandidateId() {
        return candidateId;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public Long getVotes() {
        return votes;
    }
}