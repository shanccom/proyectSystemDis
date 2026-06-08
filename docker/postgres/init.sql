-- Tablas para Auth Service
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'USER'
);

-- Tablas para Voting / Admin Service
CREATE TABLE IF NOT EXISTS elections (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING' -- PENDING, OPEN, CLOSED
);

CREATE TABLE IF NOT EXISTS candidates (
    id SERIAL PRIMARY KEY,
    election_id INTEGER REFERENCES elections(id),
    name VARCHAR(100) NOT NULL,
    party VARCHAR(100),
    photo_url TEXT
);

CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    election_id INTEGER REFERENCES elections(id),
    user_id INTEGER REFERENCES users(id),
    candidate_id INTEGER REFERENCES candidates(id),
    vote_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, election_id) -- Regla de negocio: Un voto por usuario por elección
);
