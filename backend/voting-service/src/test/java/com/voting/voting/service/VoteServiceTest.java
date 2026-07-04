package com.voting.voting.service;

import com.voting.voting.client.AdminServiceClient;
import com.voting.voting.dto.VoteRequest;
import com.voting.voting.entity.Vote;
import com.voting.voting.exception.VoteAlreadyExistsException;
import com.voting.voting.repository.VoteRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VoteServiceTest {

    @Mock
    private VoteRepository voteRepository;

    @Mock
    private AdminServiceClient adminServiceClient;

    @InjectMocks
    private VoteService voteService;

    @Test
    void shouldRegisterVoteSuccessfully() {

        VoteRequest request = new VoteRequest();
        request.setUserId(1L);
        request.setElectionId(1L);
        request.setCandidateId(2L);

        when(adminServiceClient.isElectionOpen(1L))
                .thenReturn(true);

        when(voteRepository.existsByUserIdAndElectionId(1L,1L))
                .thenReturn(false);

        voteService.registerVote(request);

        verify(voteRepository).save(any(Vote.class));
    }

    @Test
    void shouldThrowExceptionWhenUserAlreadyVoted() {

        VoteRequest request = new VoteRequest();
        request.setUserId(1L);
        request.setElectionId(1L);
        request.setCandidateId(2L);

        when(adminServiceClient.isElectionOpen(1L))
                .thenReturn(true);

        when(voteRepository.existsByUserIdAndElectionId(1L,1L))
                .thenReturn(true);

        assertThrows(
                VoteAlreadyExistsException.class,
                () -> voteService.registerVote(request)
        );

        verify(voteRepository, never())
                .save(any(Vote.class));

    }

}