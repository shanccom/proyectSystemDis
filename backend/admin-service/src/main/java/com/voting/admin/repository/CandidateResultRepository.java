package com.voting.admin.repository;

import com.voting.admin.entity.CandidateResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateResultRepository extends JpaRepository<CandidateResult, Long> {

    List<CandidateResult> findByElectionId(Long electionId);

    Optional<CandidateResult> findByElectionIdAndCandidateId(Long electionId, Long candidateId);
}
