import request from './client';

export function listAdminElections() {
  return request('/api/admin/elections');
}

export function createElection(data) {
  return request('/api/admin/elections', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateElectionStatus(electionId, status) {
  return request(`/api/admin/elections/${electionId}/status?status=${status}`, {
    method: 'PUT',
  });
}

export function addCandidate(electionId, data) {
  return request(`/api/admin/elections/${electionId}/candidates`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function listCandidates(electionId) {
  return request(`/api/admin/elections/${electionId}/candidates`);
}
