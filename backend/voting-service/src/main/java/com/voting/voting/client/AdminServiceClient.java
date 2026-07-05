package com.voting.voting.client;

import com.voting.voting.dto.CandidateResponse;
import com.voting.voting.dto.ElectionResponse;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Component
public class AdminServiceClient {

    private final RestTemplate restTemplate;

    private static final String BASE_URL =
            "http://admin-service:8081/api";

    public AdminServiceClient(
            RestTemplate restTemplate
    ) {
        this.restTemplate = restTemplate;
    }

    public ElectionResponse getElection(Long electionId) {

        return restTemplate.getForObject(
                BASE_URL + "/elections/" + electionId,
                ElectionResponse.class
        );
    }

    public CandidateResponse getCandidate(Long candidateId) {

        return restTemplate.getForObject(
                BASE_URL + "/candidates/" + candidateId,
                CandidateResponse.class
        );
    }

    public boolean isElectionOpen(Long electionId) {

        ElectionResponse election =
                getElection(electionId);

        return election != null &&
                "OPEN".equals(election.getStatus());
    }

    public String getCandidateName(
            Long candidateId
    ) {

        CandidateResponse candidate =
                getCandidate(candidateId);

        return candidate.getName();
    }

    public List<CandidateResponse>
    getCandidatesByElection(Long electionId) {

        return restTemplate.exchange(
                BASE_URL + "/elections/" +
                        electionId +
                        "/candidates",
                org.springframework.http.HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<CandidateResponse>>() {}
        ).getBody();
    }

}