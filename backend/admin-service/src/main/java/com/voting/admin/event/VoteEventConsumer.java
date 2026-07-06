package com.voting.admin.event;

import com.voting.admin.entity.AuditLog;
import com.voting.admin.entity.CandidateResult;
import com.voting.admin.entity.ElectionResult;
import com.voting.admin.repository.AuditLogRepository;
import com.voting.admin.repository.CandidateResultRepository;
import com.voting.admin.repository.ElectionResultRepository;
import com.voting.voting.event.VoteEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class VoteEventConsumer {

    private final ElectionResultRepository electionResultRepository;
    private final CandidateResultRepository candidateResultRepository;
    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    public VoteEventConsumer(ElectionResultRepository electionResultRepository,
                             CandidateResultRepository candidateResultRepository,
                             AuditLogRepository auditLogRepository,
                             ObjectMapper objectMapper) {
        this.electionResultRepository = electionResultRepository;
        this.candidateResultRepository = candidateResultRepository;
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = objectMapper;
    }

    @RabbitListener(queues = "vote.results.queue")
    @Transactional
    public void handleVoteEvent(VoteEvent event) {
        ElectionResult electionResult = electionResultRepository
                .findByElectionId(event.getElectionId())
                .orElseGet(() -> {
                    String title = event.getElectionTitle() != null
                            ? event.getElectionTitle()
                            : "Election #" + event.getElectionId();
                    ElectionResult er = new ElectionResult(
                            event.getElectionId(), title
                    );
                    er.setStatus("OPEN");
                    return electionResultRepository.save(er);
                });

        electionResult.setTotalVotes(
                (electionResult.getTotalVotes() == null ? 0L : electionResult.getTotalVotes()) + 1);
        electionResultRepository.save(electionResult);

        CandidateResult candidateResult = candidateResultRepository
                .findByElectionIdAndCandidateId(
                        event.getElectionId(), event.getCandidateId())
                .orElseGet(() -> {
                    String candidateName = event.getCandidateName() != null
                            ? event.getCandidateName()
                            : "Candidate #" + event.getCandidateId();
                    CandidateResult cr = new CandidateResult(
                            event.getElectionId(), event.getCandidateId(),
                            candidateName, null
                    );
                    return candidateResultRepository.save(cr);
                });

        candidateResult.incrementVoteCount();
        candidateResultRepository.save(candidateResult);

        try {
            String payload = objectMapper.writeValueAsString(event);
            auditLogRepository.save(new AuditLog("VOTE_REGISTERED", payload));
        } catch (JsonProcessingException e) {
            auditLogRepository.save(new AuditLog("VOTE_REGISTERED", event.toString()));
        }
    }
}
