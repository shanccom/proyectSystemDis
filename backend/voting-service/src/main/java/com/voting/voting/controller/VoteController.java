package com.voting.voting.controller;

import com.voting.voting.dto.*;
import com.voting.voting.service.ResultService;
import com.voting.voting.service.VoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/votes")
@Tag(
        name = "Voting",
        description = "Endpoints for vote registration and election results"
)
public class VoteController {

    private final VoteService voteService;
    private final ResultService resultService;

    public VoteController(
            VoteService voteService,
            ResultService resultService
    ) {
        this.voteService = voteService;
        this.resultService = resultService;
    }

    @Operation(summary = "Register a vote")
    @PostMapping
    public VoteResponse vote(
            @Valid
            @RequestBody
            VoteRequest request
    ) {
        return voteService.registerVote(request);
    }

    @Operation(summary = "Get election results")
    @GetMapping("/results/{electionId}")
    public List<ElectionResultResponse> getResults(
            @PathVariable Long electionId
    ) {
        return resultService.getResults(electionId);
    }

    @Operation(summary = "Get election statistics")
    @GetMapping("/statistics/{electionId}")
    public StatisticsResponse getStatistics(
            @PathVariable Long electionId
    ) {
        return resultService.getStatistics(electionId);
    }

}