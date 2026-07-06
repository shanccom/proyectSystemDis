import request from './client';

export function getLiveResults(electionId) {
  return request(`/api/elections/${electionId}/results`);
}

export function getLiveStatistics(electionId) {
  return request(`/api/elections/${electionId}/statistics`);
}

export function getAdminElectionResult(electionId) {
  return request(`/api/results/${electionId}`);
}

export function getAdminCandidateResults(electionId) {
  return request(`/api/results/${electionId}/candidates`);
}
