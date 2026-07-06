

package com.voting.voting.client;

import java.util.List;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import com.voting.voting.dto.CandidateResponse;
import com.voting.voting.dto.ElectionResponse;
import com.voting.voting.exception.ExternalServiceException;
import com.voting.voting.exception.ResourceNotFoundException;

@Component
public class AdminServiceClient {

    private final RestTemplate restTemplate;
    
    private static final String BASE_URL ="http://admin-service:8081/api";

    public AdminServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public ElectionResponse getElection(Long electionId) {
        try {
            return restTemplate.getForObject(BASE_URL + "/elections/" + electionId, ElectionResponse.class);
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResourceNotFoundException("La elección " + electionId + " no existe.");
        } catch (ResourceAccessException e) {
            throw new ExternalServiceException("Admin Service no disponible.");
        }
    }

    public CandidateResponse getCandidate(Long candidateId) {
        try {
            return restTemplate.getForObject(BASE_URL + "/candidates/" + candidateId, CandidateResponse.class);
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResourceNotFoundException("El candidato " + candidateId + " no existe.");
        } catch (ResourceAccessException e) {
            throw new ExternalServiceException("Admin Service no disponible.");
        }
    }

    public List<CandidateResponse> getCandidatesByElection(Long electionId) {
        try {
            return restTemplate.exchange(
                    BASE_URL + "/elections/" + electionId + "/candidates",
                    org.springframework.http.HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<CandidateResponse>>() {}
            ).getBody();
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResourceNotFoundException("La elección " + electionId + " no existe.");
        } catch (ResourceAccessException e) {
            throw new ExternalServiceException("Admin Service no disponible.");
        }
    }
    public String getCandidateName(Long candidateId) {
        CandidateResponse candidate = getCandidate(candidateId);
        return candidate.getName();
    }
}