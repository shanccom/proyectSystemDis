package com.voting.voting.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateCandidateRequest {

    @NotBlank
    private String name;

    private String party;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getParty() { return party; }
    public void setParty(String party) { this.party = party; }
}
