CREATE TABLE IF NOT EXISTS election_results (
    id SERIAL PRIMARY KEY,
    election_id INTEGER NOT NULL,
    election_title VARCHAR(200) NOT NULL,
    total_votes BIGINT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PENDING',
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(election_id)
);

CREATE TABLE IF NOT EXISTS candidate_results (
    id SERIAL PRIMARY KEY,
    election_id INTEGER NOT NULL,
    candidate_id INTEGER NOT NULL,
    candidate_name VARCHAR(200) NOT NULL,
    party VARCHAR(150),
    vote_count BIGINT DEFAULT 0,
    UNIQUE(election_id, candidate_id)
);

CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_candidate_results_election ON candidate_results(election_id);
CREATE INDEX idx_election_results_election ON election_results(election_id);
CREATE INDEX idx_audit_log_type ON audit_log(event_type);
