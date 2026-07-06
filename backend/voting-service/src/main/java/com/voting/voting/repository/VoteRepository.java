package com.voting.voting.repository;

import com.voting.voting.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {

    boolean existsByUserIdAndElectionId(Long userId, Long electionId);

    Optional<Vote> findByUserIdAndElectionId(Long userId, Long electionId);

    List<Vote> findByElectionId(Long electionId);

    List<Vote> findByCandidateId(Long candidateId);

    long countByElectionId(Long electionId);

    long countByCandidateId(Long candidateId);

    @Query("SELECT v FROM Vote v WHERE v.electionId = ?1 ORDER BY v.id DESC LIMIT 1")
    Optional<Vote> findLastByElectionId(Long electionId);
}
