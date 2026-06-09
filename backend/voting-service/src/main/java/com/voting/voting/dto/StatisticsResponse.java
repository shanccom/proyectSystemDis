package com.voting.voting.dto;

public class StatisticsResponse {

    private Long totalVotes;

    public StatisticsResponse(Long totalVotes) {
        this.totalVotes = totalVotes;
    }

    public Long getTotalVotes() {
        return totalVotes;
    }
}