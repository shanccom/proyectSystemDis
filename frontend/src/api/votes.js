import request from './client';

export function castVote(userId, electionId, candidateId) {
  return request('/api/votes', {
    method: 'POST',
    body: JSON.stringify({ userId, electionId, candidateId }),
  });
}
