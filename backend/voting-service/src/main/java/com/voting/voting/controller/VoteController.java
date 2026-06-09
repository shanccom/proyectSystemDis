package com.voting.voting.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.voting.voting.dto.ElectionResultResponse;
import com.voting.voting.dto.StatisticsResponse;
import com.voting.voting.dto.VoteRequest;
import com.voting.voting.dto.VoteResponse;
import com.voting.voting.service.VoteService;

@RestController
@RequestMapping("/api/votes")
public class VoteController {

    private final VoteService voteService;

    public VoteController(
            VoteService voteService
    ) {
        this.voteService = voteService;
    }

    @PostMapping
    public VoteResponse vote(
            @RequestBody
            VoteRequest request
    ) {
        return voteService.registerVote(
                request
        );
    }

    @GetMapping("/results/{electionId}")
    public List<ElectionResultResponse>
    results(
            @PathVariable
            Long electionId
    ) {

        return voteService.getResults(
                electionId
        );
    }

    @GetMapping("/statistics/{electionId}")
    public StatisticsResponse statistics(
            @PathVariable
            Long electionId
    ) {

        return voteService.getStatistics(
                electionId
        );
    }
}