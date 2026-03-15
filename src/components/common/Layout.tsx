import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';

export default function Layout() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="app-layout">
      <nav className="nav">
        <Link to="/" className="nav__logo">
          <span>G</span>raf
        </Link>

        <ul className="nav__links">
          <li>
            <Link
              to="/dashboard"
              className={`nav__link ${isActive('/dashboard') ? 'nav__link--active' : ''}`}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/play"
              className={`nav__link ${isActive('/play') ? 'nav__link--active' : ''}`}
            >
              Playground
            </Link>
          </li>
          <li>
            <Link
              to="/howto"
              className={`nav__link ${isActive('/howto') ? 'nav__link--active' : ''}`}
            >
              How To
            </Link>
          </li>
          <li>
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.3 1.5 1.5 2.5" />
                <path d="M9 18h6" />
                <path d="M10 22h4" />
              </svg>
            </button>
          </li>
        </ul>
      </nav>

      <main className="app-layout__content">
        <Outlet />
      </main>
    </div>
  );
}
