package com.voting.voting.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.voting.voting.client.AdminServiceClient;
import com.voting.voting.dto.ElectionResultResponse;
import com.voting.voting.dto.StatisticsResponse;
import com.voting.voting.entity.Vote;
import com.voting.voting.repository.VoteRepository;

@Service
public class ResultService {

    private final VoteRepository voteRepository;
    private final AdminServiceClient adminServiceClient;

    public ResultService(
            VoteRepository voteRepository,
            AdminServiceClient adminServiceClient
    ) {
        this.voteRepository = voteRepository;
        this.adminServiceClient = adminServiceClient;
    }

    public List<ElectionResultResponse> getResults(Long electionId) {

        List<Vote> votes = voteRepository.findByElectionId(electionId);

        Map<Long, Long> groupedVotes = votes.stream()
                .collect(Collectors.groupingBy(
                        Vote::getCandidateId,
                        Collectors.counting()
                ));

        return groupedVotes.entrySet()
                .stream()
                .map(entry -> new ElectionResultResponse(
                        entry.getKey(),
                        adminServiceClient.getCandidateName(entry.getKey()),
                        entry.getValue()
                ))
                .toList();
    }

    public StatisticsResponse getStatistics(Long electionId) {

        long totalVotes = voteRepository.countByElectionId(electionId);

        int totalCandidates = adminServiceClient
                .getCandidatesByElection(electionId)
                .size();

        return new StatisticsResponse(
                electionId,
                totalVotes,
                totalCandidates
        );
    }
}