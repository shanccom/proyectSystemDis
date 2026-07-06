package com.voting.voting.service;

import com.voting.voting.dto.VoteRequest;
import com.voting.voting.dto.VoteResponse;
import com.voting.voting.entity.Candidate;
import com.voting.voting.entity.Election;
import com.voting.voting.entity.Vote;
import com.voting.voting.event.VoteEvent;
import com.voting.voting.event.VoteEventPublisher;
import com.voting.voting.exception.VoteAlreadyExistsException;
import com.voting.voting.repository.CandidateRepository;
import com.voting.voting.repository.ElectionRepository;
import com.voting.voting.repository.VoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;

@Service
public class VoteService {

    private final VoteRepository voteRepository;
    private final ElectionRepository electionRepository;
    private final CandidateRepository candidateRepository;
    private final VoteEventPublisher eventPublisher;

    public VoteService(VoteRepository voteRepository,
                       ElectionRepository electionRepository,
                       CandidateRepository candidateRepository,
                       VoteEventPublisher eventPublisher) {
        this.voteRepository = voteRepository;
        this.electionRepository = electionRepository;
        this.candidateRepository = candidateRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public VoteResponse registerVote(VoteRequest request) {
        Election election = electionRepository.findById(request.getElectionId())
                .orElseThrow(() -> new IllegalArgumentException("Election not found"));

        if (!election.isOpen()) {
            throw new IllegalStateException("Election is not open");
        }

        if (voteRepository.existsByUserIdAndElectionId(
                request.getUserId(), request.getElectionId())) {
            throw new VoteAlreadyExistsException();
        }

        String previousHash = voteRepository.findLastByElectionId(request.getElectionId())
                .map(Vote::getHash)
                .orElse("0");

        Vote vote = new Vote();
        vote.setUserId(request.getUserId());
        vote.setElectionId(request.getElectionId());
        vote.setCandidateId(request.getCandidateId());
        vote.setPreviousHash(previousHash);
        vote.setHash(computeHash(vote, previousHash));
        vote.setVotedAt(LocalDateTime.now());

        vote = voteRepository.save(vote);

        String electionTitle = election.getTitle();
        String candidateName = candidateRepository.findById(request.getCandidateId())
                .map(Candidate::getName)
                .orElse("Candidate #" + request.getCandidateId());

        eventPublisher.publish(new VoteEvent(
                vote.getId(), vote.getUserId(), vote.getElectionId(), electionTitle,
                vote.getCandidateId(), candidateName, vote.getHash(),
                vote.getPreviousHash(), vote.getVotedAt()
        ));

        return new VoteResponse("Vote registered successfully", vote.getHash());
    }

    private String computeHash(Vote vote, String previousHash) {
        try {
            String data = vote.getUserId() + "|" +
                    vote.getElectionId() + "|" +
                    vote.getCandidateId() + "|" +
                    vote.getVotedAt() + "|" +
                    previousHash;
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
