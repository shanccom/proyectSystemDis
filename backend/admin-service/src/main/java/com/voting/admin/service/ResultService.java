package com.voting.admin.service;

import com.voting.admin.entity.CandidateResult;
import com.voting.admin.entity.ElectionResult;
import com.voting.admin.repository.CandidateResultRepository;
import com.voting.admin.repository.ElectionResultRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResultService {

    private final ElectionResultRepository electionResultRepository;
    private final CandidateResultRepository candidateResultRepository;

    public ResultService(ElectionResultRepository electionResultRepository,
                         CandidateResultRepository candidateResultRepository) {
        this.electionResultRepository = electionResultRepository;
        this.candidateResultRepository = candidateResultRepository;
    }

    public ElectionResult getElectionResult(Long electionId) {
        return electionResultRepository.findByElectionId(electionId)
                .orElseThrow(() -> new IllegalArgumentException("No results for election " + electionId));
    }

    public List<CandidateResult> getCandidateResults(Long electionId) {
        return candidateResultRepository.findByElectionId(electionId);
    }
}
