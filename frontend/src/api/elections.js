import request from './client';

export function listElections() {
  return request('/api/elections');
}

export function getElection(id) {
  return request(`/api/elections/${id}`);
}

export function getCandidates(electionId) {
  return request(`/api/elections/${electionId}/candidates`);
}
