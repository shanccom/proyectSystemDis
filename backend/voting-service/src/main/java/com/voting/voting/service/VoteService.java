package com.voting.voting.service;

import com.voting.voting.client.AdminServiceClient;
import com.voting.voting.dto.VoteRequest;
import com.voting.voting.dto.VoteResponse;
import com.voting.voting.entity.Vote;
import com.voting.voting.exception.VoteAlreadyExistsException;
import com.voting.voting.repository.VoteRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class VoteService {

    private final VoteRepository voteRepository;
    private final AdminServiceClient adminServiceClient;

    public VoteService(
            VoteRepository voteRepository,
            AdminServiceClient adminServiceClient
    ) {
        this.voteRepository = voteRepository;
        this.adminServiceClient = adminServiceClient;
    }

    public VoteResponse registerVote(VoteRequest request) {

        validateElection(request.getElectionId());
        validateCandidate(request.getCandidateId());
        validateElectionStatus(request.getElectionId());
        validateDuplicateVote(request.getUserId(), request.getElectionId());

        Vote vote = new Vote();
        vote.setUserId(request.getUserId());
        vote.setElectionId(request.getElectionId());
        vote.setCandidateId(request.getCandidateId());
        vote.setVotedAt(LocalDateTime.now());

        voteRepository.save(vote);

        return new VoteResponse("Vote registered successfully");
    }

    private void validateElection(Long electionId) {
        adminServiceClient.getElection(electionId);
    }

    private void validateCandidate(Long candidateId) {
        adminServiceClient.getCandidate(candidateId);
    }

    private void validateElectionStatus(Long electionId) {
        if (!adminServiceClient.isElectionOpen(electionId)) {
            throw new IllegalStateException("Election is closed");
        }
    }

    private void validateDuplicateVote(Long userId, Long electionId) {
        if (voteRepository.existsByUserIdAndElectionId(userId, electionId)) {
            throw new VoteAlreadyExistsException();
        }
    }
}