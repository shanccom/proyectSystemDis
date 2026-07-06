package com.voting.voting.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.voting.voting.client.AdminServiceClient;
import com.voting.voting.dto.CandidateResponse;
import com.voting.voting.dto.ElectionResponse;
import com.voting.voting.dto.VoteRequest;
import com.voting.voting.entity.Vote;
import com.voting.voting.exception.InvalidCandidateException;
import com.voting.voting.exception.VoteAlreadyExistsException;
import com.voting.voting.repository.VoteRepository;

@ExtendWith(MockitoExtension.class)
class VoteServiceTest {

    @Mock
    private VoteRepository voteRepository;

    @Mock
    private AdminServiceClient adminServiceClient;

    @InjectMocks
    private VoteService voteService;

    private ElectionResponse openElection() {
        ElectionResponse election = new ElectionResponse();
        election.setId(1L);
        election.setTitle("Elección de prueba");
        election.setStatus("OPEN");
        return election;
    }

    private CandidateResponse candidateOf(Long electionId) {
        CandidateResponse candidate = new CandidateResponse();
        candidate.setId(2L);
        candidate.setName("Candidato de prueba");
        candidate.setElectionId(electionId);
        return candidate;
    }

    @Test
    void shouldRegisterVoteSuccessfully() {

        VoteRequest request = new VoteRequest();
        request.setUserId(1L);
        request.setElectionId(1L);
        request.setCandidateId(2L);

        when(adminServiceClient.getElection(1L)).thenReturn(openElection());
        when(adminServiceClient.getCandidate(2L)).thenReturn(candidateOf(1L));
        when(voteRepository.existsByUserIdAndElectionId(1L, 1L)).thenReturn(false);

        voteService.registerVote(request);

        verify(voteRepository).save(any(Vote.class));
    }

    @Test
    void shouldThrowExceptionWhenUserAlreadyVoted() {

        VoteRequest request = new VoteRequest();
        request.setUserId(1L);
        request.setElectionId(1L);
        request.setCandidateId(2L);

        when(adminServiceClient.getElection(1L)).thenReturn(openElection());
        when(adminServiceClient.getCandidate(2L)).thenReturn(candidateOf(1L));
        when(voteRepository.existsByUserIdAndElectionId(1L, 1L)).thenReturn(true);

        assertThrows(
                VoteAlreadyExistsException.class,
                () -> voteService.registerVote(request)
        );

        verify(voteRepository, never()).save(any(Vote.class));
    }

    @Test
    void shouldThrowExceptionWhenCandidateDoesNotBelongToElection() {

        VoteRequest request = new VoteRequest();
        request.setUserId(1L);
        request.setElectionId(1L);
        request.setCandidateId(2L);

        when(adminServiceClient.getElection(1L)).thenReturn(openElection());
        when(adminServiceClient.getCandidate(2L)).thenReturn(candidateOf(99L)); // pertenece a otra elección

        assertThrows(
                InvalidCandidateException.class,
                () -> voteService.registerVote(request)
        );

        verify(voteRepository, never()).save(any(Vote.class));
    }
}