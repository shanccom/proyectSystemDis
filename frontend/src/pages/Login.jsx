import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, register } from '../api/auth';
import ErrorAlert from '../components/ErrorAlert';

export default function Login() {
  const { user, loginUser } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) {
    navigate(user.role === 'ADMIN' ? '/admin' : '/', { replace: true });
    return null;
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      let data;
      if (isRegister) {
        data = await register(form.username, form.email, form.password);
      } else {
        data = await login(form.email, form.password);
      }
      loginUser(
        { id: data.userId, email: data.email, role: data.role },
        data.token
      );
      navigate(data.role === 'ADMIN' ? '/admin' : '/', { replace: true });
    } catch (err) {
      setError(err.message || 'Error de autenticación');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-center">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-icon">◈</span>
          <h1>{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
          <p className="auth-sub">
            {isRegister
              ? 'Registrate para participar en las votaciones'
              : 'Ingresa con tu cuenta para votar'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <ErrorAlert message={error} onClose={() => setError('')} />
          {isRegister && (
            <div className="form-group">
              <label htmlFor="username">Usuario</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                minLength={3}
                placeholder="Tu nombre de usuario"
                value={form.username}
                onChange={handleChange}
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="usuario@ejemplo.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="Ingresa tu contraseña"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Procesando...' : isRegister ? 'Crear cuenta' : 'Ingresar'}
          </button>
        </form>
        <p className="auth-switch">
          {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
          <button className="link-btn" onClick={() => { setIsRegister(!isRegister); setError(''); }}>
            {isRegister ? 'Inicia sesión' : 'Regístrate'}
          </button>
        </p>
      </div>
    </div>
  );
}
