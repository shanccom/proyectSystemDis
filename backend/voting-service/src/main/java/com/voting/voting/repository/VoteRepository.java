package com.voting.voting.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.voting.voting.entity.Vote;

public interface VoteRepository
        extends JpaRepository<Vote, Long> {

    boolean existsByUserIdAndElectionId(
            Long userId,
            Long electionId
    );

    List<Vote> findByElectionId(Long electionId);

    long countByElectionId(Long electionId);
}