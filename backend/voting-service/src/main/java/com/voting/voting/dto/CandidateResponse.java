package com.voting.voting.dto;

public class CandidateResponse {

    private Long id;
    private String name;
    private Long electionId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
    public Long getElectionId() {
        return electionId; 
    }

    public void setElectionId(Long electionId) { 
        this.electionId = electionId; 
    }


}