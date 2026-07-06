package com.voting.voting.service;

import com.voting.voting.client.AdminServiceClient;
import com.voting.voting.dto.CandidateResponse;
import com.voting.voting.dto.ElectionResponse;
import com.voting.voting.dto.VoteRequest;
import com.voting.voting.dto.VoteResponse;
import com.voting.voting.entity.Vote;
import com.voting.voting.exception.InvalidCandidateException;
import com.voting.voting.exception.VoteAlreadyExistsException;
import com.voting.voting.repository.VoteRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class VoteService {

    private final VoteRepository voteRepository;
    private final AdminServiceClient adminServiceClient;

    public VoteService(VoteRepository voteRepository, AdminServiceClient adminServiceClient) {
        this.voteRepository = voteRepository;
        this.adminServiceClient = adminServiceClient;
    }

    public VoteResponse registerVote(VoteRequest request) {

        ElectionResponse election = adminServiceClient.getElection(request.getElectionId());

        if (!"OPEN".equals(election.getStatus())) {
            throw new IllegalStateException("Election is closed");
        }

        CandidateResponse candidate = adminServiceClient.getCandidate(request.getCandidateId());

        if (candidate.getElectionId() == null || !candidate.getElectionId().equals(election.getId())) {
            throw new InvalidCandidateException("El candidato no pertenece a la elección indicada.");
        }

        if (voteRepository.existsByUserIdAndElectionId(request.getUserId(), request.getElectionId())) {
            throw new VoteAlreadyExistsException();
        }

        Vote vote = new Vote();
        vote.setUserId(request.getUserId());
        vote.setElectionId(request.getElectionId());
        vote.setCandidateId(request.getCandidateId());
        vote.setVotedAt(LocalDateTime.now());

        try {
            voteRepository.save(vote);
        } catch (DataIntegrityViolationException e) {
            // Protección final ante condición de carrera concurrente
            throw new VoteAlreadyExistsException();
        }

        return new VoteResponse("Vote registered successfully");
    }
}