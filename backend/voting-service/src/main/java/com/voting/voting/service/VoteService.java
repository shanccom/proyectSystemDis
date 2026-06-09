package com.voting.voting.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.voting.voting.dto.ElectionResultResponse;
import com.voting.voting.dto.StatisticsResponse;
import com.voting.voting.dto.VoteRequest;
import com.voting.voting.dto.VoteResponse;
import com.voting.voting.entity.Vote;
import com.voting.voting.exception.VoteAlreadyExistsException;
import com.voting.voting.repository.VoteRepository;

@Service
public class VoteService {

    private final VoteRepository voteRepository;

    public VoteService(
            VoteRepository voteRepository
    ) {
        this.voteRepository = voteRepository;
    }

    public VoteResponse registerVote(
            VoteRequest request
    ) {

        if (
                voteRepository.existsByUserIdAndElectionId(
                        request.getUserId(),
                        request.getElectionId()
                )
        ) {
            throw new VoteAlreadyExistsException();
        }

        Vote vote = new Vote();

        vote.setUserId(request.getUserId());
        vote.setElectionId(request.getElectionId());
        vote.setCandidateId(request.getCandidateId());
        vote.setVotedAt(LocalDateTime.now());

        voteRepository.save(vote);

        return new VoteResponse(
                "Vote registered successfully"
        );
    }

    public List<ElectionResultResponse>
    getResults(Long electionId) {

        List<Vote> votes =
                voteRepository.findByElectionId(
                        electionId
                );

        Map<Long, Long> groupedVotes =
                votes.stream()
                        .collect(
                                Collectors.groupingBy(
                                        Vote::getCandidateId,
                                        Collectors.counting()
                                )
                        );

        return groupedVotes.entrySet()
                .stream()
                .map(entry ->
                        new ElectionResultResponse(
                                entry.getKey(),
                                entry.getValue()
                        )
                )
                .toList();
    }

    public StatisticsResponse
    getStatistics(Long electionId) {

        long totalVotes =
                voteRepository.countByElectionId(
                        electionId
                );

        return new StatisticsResponse(
                totalVotes
        );
    }
}