package com.voting.voting.service;

import com.voting.voting.dto.ElectionResultResponse;
import com.voting.voting.dto.StatisticsResponse;
import com.voting.voting.entity.Candidate;
import com.voting.voting.entity.Vote;
import com.voting.voting.repository.CandidateRepository;
import com.voting.voting.repository.VoteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ResultService {

    private final VoteRepository voteRepository;
    private final CandidateRepository candidateRepository;

    public ResultService(VoteRepository voteRepository,
                         CandidateRepository candidateRepository) {
        this.voteRepository = voteRepository;
        this.candidateRepository = candidateRepository;
    }

    public List<ElectionResultResponse> getResults(Long electionId) {
        List<Vote> votes = voteRepository.findByElectionId(electionId);

        Map<Long, Long> grouped = votes.stream()
                .collect(Collectors.groupingBy(
                        Vote::getCandidateId, Collectors.counting()));

        List<Candidate> candidates = candidateRepository.findByElectionId(electionId);

        return candidates.stream().map(c -> {
            Long count = grouped.getOrDefault(c.getId(), 0L);
            return new ElectionResultResponse(c.getId(), c.getName(), count);
        }).toList();
    }

    public StatisticsResponse getStatistics(Long electionId) {
        long totalVotes = voteRepository.countByElectionId(electionId);
        int totalCandidates = candidateRepository.findByElectionId(electionId).size();
        return new StatisticsResponse(electionId, totalVotes, totalCandidates);
    }
}
