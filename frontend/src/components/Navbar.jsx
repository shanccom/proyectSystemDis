import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <a href="/" className="navbar-brand">
          <span className="brand-icon">◈</span>
          <span>Voto Electrónico</span>
        </a>
        {user && (
          <div className="navbar-right">
            <span className="navbar-role">{user.role}</span>
            <span className="navbar-user">{user.email}</span>
            <button className="btn btn-sm btn-outline" onClick={logout}>
              Salir
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
