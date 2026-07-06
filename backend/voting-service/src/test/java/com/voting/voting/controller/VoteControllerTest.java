package com.voting.voting.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.voting.voting.dto.VoteRequest;
import com.voting.voting.dto.VoteResponse;
import com.voting.voting.service.ResultService;
import com.voting.voting.service.VoteService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(VoteController.class)
class VoteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private VoteService voteService;

    @MockBean
    private ResultService resultService;

    @Autowired
    private ObjectMapper mapper;

    @Test
    void shouldRegisterVote() throws Exception {
        VoteRequest request = new VoteRequest();
        request.setUserId(1L);
        request.setElectionId(1L);
        request.setCandidateId(2L);

        Mockito.when(voteService.registerVote(Mockito.any()))
                .thenReturn(new VoteResponse("Vote registered successfully", "abc123"));

        mockMvc.perform(post("/api/votes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }
}
