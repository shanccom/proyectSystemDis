package com.voting.voting.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Vote registration request")
public class VoteRequest {

    @Schema(example = "1")
    @NotNull
    private Long userId;

    @Schema(example = "10")
    @NotNull
    private Long electionId;

    @Schema(example = "3")
    @NotNull
    private Long candidateId;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getElectionId() {
        return electionId;
    }

    public void setElectionId(Long electionId) {
        this.electionId = electionId;
    }

    public Long getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(Long candidateId) {
        this.candidateId = candidateId;
    }

}