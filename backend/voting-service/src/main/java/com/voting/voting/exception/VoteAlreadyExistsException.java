package com.voting.voting.exception;

public class VoteAlreadyExistsException
        extends RuntimeException {

    public VoteAlreadyExistsException() {
        super("User already voted in this election");
    }
}