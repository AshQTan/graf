import { useLocation } from 'react-router-dom';

export default function AuthPage() {
  const location = useLocation();
  const isSignup = location.pathname === '/signup';

  return (
    <div className="page-placeholder">
      <div className="page-placeholder__icon">{isSignup ? 'Sign Up' : 'Login'}</div>
      <h1 className="page-placeholder__title">
        {isSignup ? 'Create Account' : 'Log In'}
      </h1>
      <p className="page-placeholder__description">
        {isSignup
          ? 'Sign up to save your graphs, access insights, and sync across devices.'
          : 'Welcome back. Sign in to your Graf account.'}
      </p>
      <div className="page-placeholder__badge">Phase 3</div>
    </div>
  );
}
