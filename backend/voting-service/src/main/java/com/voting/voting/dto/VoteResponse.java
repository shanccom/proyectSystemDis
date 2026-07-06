package com.voting.voting.dto;

public class VoteResponse {

    private String message;
    private String hash;

    public VoteResponse() {}

    public VoteResponse(String message, String hash) {
        this.message = message;
        this.hash = hash;
    }

    public String getMessage() { return message; }
    public String getHash() { return hash; }
}
