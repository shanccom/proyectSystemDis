package com.voting.voting.dto;

public class VoteResponse {

    private String message;

    public VoteResponse() {}

    public VoteResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}