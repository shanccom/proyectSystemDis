package com.voting.voting.controller;

import com.voting.voting.entity.Candidate;
import com.voting.voting.entity.Election;
import com.voting.voting.repository.CandidateRepository;
import com.voting.voting.repository.ElectionRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/elections")
public class ElectionController {

    private final ElectionRepository electionRepository;
    private final CandidateRepository candidateRepository;

    public ElectionController(ElectionRepository electionRepository,
                              CandidateRepository candidateRepository) {
        this.electionRepository = electionRepository;
        this.candidateRepository = candidateRepository;
    }

    @GetMapping
    public List<Election> listOpen() {
        return electionRepository.findByStatus("OPEN");
    }

    @GetMapping("/{id}")
    public Election getById(@PathVariable Long id) {
        return electionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Election not found"));
    }

    @GetMapping("/{id}/candidates")
    public List<Candidate> getCandidates(@PathVariable Long id) {
        return candidateRepository.findByElectionId(id);
    }
}
