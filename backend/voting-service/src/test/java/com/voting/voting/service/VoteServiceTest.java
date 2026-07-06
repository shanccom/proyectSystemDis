package com.voting.voting.service;

import com.voting.voting.dto.VoteRequest;
import com.voting.voting.entity.Election;
import com.voting.voting.entity.Vote;
import com.voting.voting.event.VoteEventPublisher;
import com.voting.voting.exception.VoteAlreadyExistsException;
import com.voting.voting.repository.ElectionRepository;
import com.voting.voting.repository.VoteRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VoteServiceTest {

    @Mock
    private VoteRepository voteRepository;

    @Mock
    private ElectionRepository electionRepository;

    @Mock
    private VoteEventPublisher eventPublisher;

    @InjectMocks
    private VoteService voteService;

    @Test
    void shouldRegisterVoteSuccessfully() {
        VoteRequest request = new VoteRequest();
        request.setUserId(1L);
        request.setElectionId(1L);
        request.setCandidateId(2L);

        Election election = new Election();
        election.setStatus("OPEN");

        when(electionRepository.findById(1L)).thenReturn(Optional.of(election));
        when(voteRepository.existsByUserIdAndElectionId(1L, 1L)).thenReturn(false);
        when(voteRepository.findLastByElectionId(1L)).thenReturn(Optional.empty());
        when(voteRepository.save(any(Vote.class))).thenAnswer(i -> i.getArgument(0));

        voteService.registerVote(request);

        verify(voteRepository).save(any(Vote.class));
        verify(eventPublisher).publish(any());
    }

    @Test
    void shouldThrowExceptionWhenUserAlreadyVoted() {
        VoteRequest request = new VoteRequest();
        request.setUserId(1L);
        request.setElectionId(1L);
        request.setCandidateId(2L);

        Election election = new Election();
        election.setStatus("OPEN");

        when(electionRepository.findById(1L)).thenReturn(Optional.of(election));
        when(voteRepository.existsByUserIdAndElectionId(1L, 1L)).thenReturn(true);

        assertThrows(VoteAlreadyExistsException.class, () -> voteService.registerVote(request));
        verify(voteRepository, never()).save(any(Vote.class));
    }

    @Test
    void shouldThrowExceptionWhenElectionClosed() {
        VoteRequest request = new VoteRequest();
        request.setUserId(1L);
        request.setElectionId(1L);
        request.setCandidateId(2L);

        Election election = new Election();

        when(electionRepository.findById(1L)).thenReturn(Optional.of(election));

        assertThrows(IllegalStateException.class, () -> voteService.registerVote(request));
        verify(voteRepository, never()).save(any(Vote.class));
    }
}
