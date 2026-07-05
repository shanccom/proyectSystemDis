package com.voting.voting.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.voting.voting.entity.Vote;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {

    boolean existsByUserIdAndElectionId(
            Long userId,
            Long electionId
    );

    Optional<Vote> findByUserIdAndElectionId(
            Long userId,
            Long electionId
    );

    List<Vote> findByElectionId(
            Long electionId
    );

    List<Vote> findByCandidateId(
            Long candidateId
    );

    long countByElectionId(
            Long electionId
    );

    long countByCandidateId(
            Long candidateId
    );

}