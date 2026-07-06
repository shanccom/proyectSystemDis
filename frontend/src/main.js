const API_GATEWAY = import.meta.env.VITE_API_GATEWAY || 'http://localhost:8080';

const steps = ['login', 'elections', 'vote', 'confirm', 'results'];
let currentStep = 0;
let state = {
  token: null,
  user: null,
  elections: [],
  selectedElection: null,
  candidates: [],
  selectedCandidate: null,
  results: [],
};

function $(id) { return document.getElementById(id); }

function showStep(id) {
  steps.forEach(s => $(s).classList.add('hidden'));
  $(id).classList.remove('hidden');
  updateStepIndicator(id);
}

function updateStepIndicator(id) {
  const idx = steps.indexOf(id);
  steps.forEach((s, i) => {
    const el = $(`step-${s}`);
    el.classList.remove('active', 'done');
    if (i < idx) el.classList.add('done');
    else if (i === idx) el.classList.add('active');
  });
}

async function apiCall(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
  try {
    const res = await fetch(`${API_GATEWAY}${path}`, { ...options, headers, mode: 'cors' });
    if (!res.ok) {
      const txt = await res.text();
      return { error: txt || `HTTP ${res.status}` };
    }
    const txt = await res.text();
    return txt ? { data: JSON.parse(txt) } : { data: null };
  } catch (e) {
    return { error: 'Service not available' };
  }
}

function getMockElections() {
  return [
    { id: 1, title: 'Eleccion 2026 - Rector', description: 'Votacion para rector UNSA', status: 'OPEN' },
    { id: 2, title: 'Eleccion Consejo Universitario', description: 'Representantes estudiantiles', status: 'OPEN' },
    { id: 3, title: 'Eleccion Decano', description: 'Decano de la facultad', status: 'PENDING' },
  ];
}

function getMockCandidates(electionId) {
  const all = {
    1: [{ id: 1, name: 'Dr. Carlos Lopez', party: 'Lista A' }, { id: 2, name: 'Dra. Maria Torres', party: 'Lista B' }, { id: 3, name: 'Mg. Juan Perez', party: 'Lista C' }],
    2: [{ id: 4, name: 'Ana Quispe', party: 'Frente Unico' }, { id: 5, name: 'Luis Garcia', party: 'Nueva Generacion' }],
  };
  return all[electionId] || [];
}

function getMockResults(electionId) {
  const all = {
    1: [{ name: 'Dr. Carlos Lopez', votes: 1240, pct: 42 }, { name: 'Dra. Maria Torres', votes: 980, pct: 33 }, { name: 'Mg. Juan Perez', votes: 740, pct: 25 }],
    2: [{ name: 'Ana Quispe', votes: 560, pct: 58 }, { name: 'Luis Garcia', votes: 410, pct: 42 }],
  };
  return all[electionId] || [];
}

function simulateDelay() { return new Promise(r => setTimeout(r, 500)); }

$('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = $('login-email').value;
  const password = $('login-password').value;
  $('login-btn').disabled = true;
  $('login-btn').textContent = 'Loading...';

  const result = await apiCall('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  await simulateDelay();

  if (result.data) {
    state.token = result.data.token;
    state.user = { id: result.data.userId, email, name: email.split('@')[0], role: result.data.role };
  } else {
    state.user = { id: 1, email, name: email.split('@')[0] };
    state.token = 'mock-token';
  }

  $('user-name').textContent = state.user.name;
  $('login-btn').disabled = false;
  $('login-btn').textContent = 'Login';
  showStep('elections');
  loadElections();
});

$('register-link').addEventListener('click', (e) => {
  e.preventDefault();
  $('login-title').textContent = 'Register';
  $('login-btn').textContent = 'Register';
  $('login-form').onsubmit = async (ev) => {
    ev.preventDefault();
    const email = $('login-email').value;
    const password = $('login-password').value;
    const username = email.split('@')[0];
    $('login-btn').disabled = true;
    $('login-btn').textContent = 'Loading...';

    const result = await apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    await simulateDelay();

    if (result.data) {
      state.token = result.data.token;
      state.user = { id: result.data.userId, email, name: username, role: result.data.role };
      $('user-name').textContent = state.user.name;
      $('login-btn').disabled = false;
      $('login-btn').textContent = 'Register';
      showStep('elections');
      loadElections();
    } else {
      $('login-btn').disabled = false;
      $('login-btn').textContent = 'Register';
      $('login-error').classList.remove('hidden');
      $('login-error').textContent = 'Registration failed';
    }
  };
});

async function loadElections() {
  $('elections-list').innerHTML = '<p style="color:#999">Loading elections...</p>';
  const result = await apiCall('/api/elections');
  await simulateDelay();
  state.elections = result.data || getMockElections();
  renderElections();
}

function renderElections() {
  const list = $('elections-list');
  if (!state.elections.length) {
    list.innerHTML = '<p style="color:#999">No elections available.</p>';
    return;
  }
  list.innerHTML = state.elections.map(e => `
    <li onclick="selectElection(${e.id})" data-id="${e.id}">
      <h3>${e.title}</h3>
      <p>${e.description || ''} <span style="font-weight:600;color:${e.status === 'OPEN' ? '#2d6a4f' : '#999'}">[${e.status}]</span></p>
    </li>
  `).join('');
}

function selectElection(id) {
  state.selectedElection = state.elections.find(e => e.id === id);
  state.selectedCandidate = null;
  document.querySelectorAll('#elections-list li').forEach(li => {
    li.classList.toggle('selected', parseInt(li.dataset.id) === id);
  });
  $('selected-election-name').textContent = state.selectedElection.title;
  showStep('vote');
  loadCandidates(id);
}

async function loadCandidates(electionId) {
  $('candidates-list').innerHTML = '<p style="color:#999">Loading candidates...</p>';
  const result = await apiCall(`/api/elections/${electionId}/candidates`);
  await simulateDelay();
  state.candidates = result.data || getMockCandidates(electionId);
  renderCandidates();
}

function renderCandidates() {
  const list = $('candidates-list');
  if (!state.candidates.length) {
    list.innerHTML = '<p style="color:#999">No candidates for this election.</p>';
    return;
  }
  list.innerHTML = state.candidates.map(c => `
    <li onclick="selectCandidate(${c.id})" data-id="${c.id}">
      <div class="candidate-avatar">${c.name.charAt(0)}</div>
      <div>
        <strong>${c.name}</strong>
        <p>${c.party || 'Independent'}</p>
      </div>
    </li>
  `).join('');
}

function selectCandidate(id) {
  state.selectedCandidate = state.candidates.find(c => c.id === id);
  document.querySelectorAll('#candidates-list li').forEach(li => {
    li.classList.toggle('selected', parseInt(li.dataset.id) === id);
  });
  $('vote-btn').disabled = false;
}

$('vote-btn').addEventListener('click', async () => {
  if (!state.selectedCandidate || !state.selectedElection) return;
  $('vote-btn').disabled = true;
  $('vote-btn').textContent = 'Submitting vote...';

  const result = await apiCall('/api/votes', {
    method: 'POST',
    body: JSON.stringify({
      userId: state.user.id,
      electionId: state.selectedElection.id,
      candidateId: state.selectedCandidate.id,
    }),
  });

  await simulateDelay();
  $('vote-btn').disabled = false;
  $('vote-btn').textContent = 'Vote';
  showStep('confirm');
  $('confirm-candidate').textContent = state.selectedCandidate.name;
  $('confirm-election').textContent = state.selectedElection.title;
});

$('confirm-yes').addEventListener('click', () => {
  $('confirm-yes').disabled = true;
  $('confirm-no').disabled = true;
  $('vote-success').classList.remove('hidden');
  $('confirm-yes').textContent = 'Vote registered!';
  setTimeout(() => {
    showStep('results');
    loadResults(state.selectedElection.id);
  }, 1500);
});

$('confirm-no').addEventListener('click', () => {
  state.selectedCandidate = null;
  $('vote-btn').disabled = true;
  showStep('vote');
});

async function loadResults(electionId) {
  $('results-title').textContent = `Results: ${state.selectedElection.title}`;
  $('results-body').innerHTML = '<p style="color:#999">Loading results...</p>';
  const result = await apiCall(`/api/results/${electionId}/candidates`);
  await simulateDelay();
  state.results = result.data || getMockResults(electionId);
  renderResults();
}

function renderResults() {
  const body = $('results-body');
  if (!state.results.length) {
    body.innerHTML = '<p style="color:#999">No results yet.</p>';
    return;
  }
  const total = state.results.reduce((s, r) => s + (r.voteCount || r.votes || 0), 0);
  body.innerHTML = state.results.map(r => {
    const votes = r.voteCount || r.votes || 0;
    const pct = total > 0 ? Math.round((votes / total) * 100) : 0;
    return `
    <div class="result-item">
      <span class="result-name">${r.candidateName || r.name}</span>
      <div class="result-bar">
        <div class="result-fill" style="width:${pct}%">${pct}%</div>
      </div>
      <span style="font-size:0.85rem;color:#666;width:60px;text-align:right">${votes} votes</span>
    </div>`;
  }).join('');
  body.innerHTML += `<p style="margin-top:1rem;font-weight:600">Total: ${total} votes</p>`;
}

$('back-to-elections').addEventListener('click', () => {
  showStep('elections');
  loadElections();
});

showStep('login');
