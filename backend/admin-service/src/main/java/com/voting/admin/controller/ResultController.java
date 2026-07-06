package com.voting.admin.controller;

import com.voting.admin.entity.CandidateResult;
import com.voting.admin.entity.ElectionResult;
import com.voting.admin.service.ResultService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/results")
public class ResultController {

    private final ResultService resultService;

    public ResultController(ResultService resultService) {
        this.resultService = resultService;
    }

    @GetMapping("/{electionId}")
    public ElectionResult getElectionResult(@PathVariable Long electionId) {
        return resultService.getElectionResult(electionId);
    }

    @GetMapping("/{electionId}/candidates")
    public List<CandidateResult> getCandidateResults(@PathVariable Long electionId) {
        return resultService.getCandidateResults(electionId);
    }
}
