package com.voting.voting.dto;

public class StatisticsResponse {

    private Long electionId;
    private Long totalVotes;
    private Integer totalCandidates;

    public StatisticsResponse(Long electionId, Long totalVotes, Integer totalCandidates) {
        this.electionId = electionId;
        this.totalVotes = totalVotes;
        this.totalCandidates = totalCandidates;
    }

    public Long getTotalVotes() {
        return totalVotes;
    }

    public Long getElectionId() {
        return electionId;
    }

    public Integer getTotalCandidates() {
        return totalCandidates;
    }
}