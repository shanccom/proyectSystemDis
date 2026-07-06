package com.voting.voting.controller;

import com.voting.voting.dto.CreateCandidateRequest;
import com.voting.voting.dto.CreateElectionRequest;
import com.voting.voting.entity.Candidate;
import com.voting.voting.entity.Election;
import com.voting.voting.repository.CandidateRepository;
import com.voting.voting.repository.ElectionRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/elections")
public class AdminElectionController {

    private final ElectionRepository electionRepository;
    private final CandidateRepository candidateRepository;

    public AdminElectionController(ElectionRepository electionRepository,
                                   CandidateRepository candidateRepository) {
        this.electionRepository = electionRepository;
        this.candidateRepository = candidateRepository;
    }

    @GetMapping
    public List<Election> listAll() {
        return electionRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Election> create(@Valid @RequestBody CreateElectionRequest req) {
        Election election = new Election();
        election.setTitle(req.getTitle());
        election.setDescription(req.getDescription());
        election.setStartDate(req.getStartDate());
        election.setEndDate(req.getEndDate());
        election.setStatus("PENDING");
        Election saved = electionRepository.save(election);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Election> updateStatus(@PathVariable Long id,
                                                  @RequestParam String status) {
        Election election = electionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Elección no encontrada"));
        if (!List.of("PENDING", "OPEN", "CLOSED").contains(status.toUpperCase())) {
            throw new IllegalArgumentException("Estado inválido: " + status);
        }
        election.setStatus(status.toUpperCase());
        Election saved = electionRepository.save(election);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/candidates")
    public ResponseEntity<Candidate> addCandidate(@PathVariable Long id,
                                                   @Valid @RequestBody CreateCandidateRequest req) {
        Election election = electionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Elección no encontrada"));
        Candidate candidate = new Candidate();
        candidate.setElectionId(election.getId());
        candidate.setName(req.getName());
        candidate.setParty(req.getParty());
        candidate.setCreatedAt(LocalDateTime.now());
        Candidate saved = candidateRepository.save(candidate);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}/candidates")
    public List<Candidate> listCandidates(@PathVariable Long id) {
        return candidateRepository.findByElectionId(id);
    }
}
