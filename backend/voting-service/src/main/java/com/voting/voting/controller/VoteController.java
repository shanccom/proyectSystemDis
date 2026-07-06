package com.voting.voting.controller;

import com.voting.voting.dto.*;
import com.voting.voting.service.ResultService;
import com.voting.voting.service.VoteService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class VoteController {

    private final VoteService voteService;
    private final ResultService resultService;

    public VoteController(VoteService voteService, ResultService resultService) {
        this.voteService = voteService;
        this.resultService = resultService;
    }

    @PostMapping("/votes")
    public VoteResponse vote(@Valid @RequestBody VoteRequest request) {
        return voteService.registerVote(request);
    }

    @GetMapping("/elections/{electionId}/results")
    public List<ElectionResultResponse> getResults(@PathVariable Long electionId) {
        return resultService.getResults(electionId);
    }

    @GetMapping("/elections/{electionId}/statistics")
    public StatisticsResponse getStatistics(@PathVariable Long electionId) {
        return resultService.getStatistics(electionId);
    }
}
