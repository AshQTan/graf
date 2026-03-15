import { Link } from 'react-router-dom';

export default function HowToPage() {
  return (
    <div className="page-placeholder">
      <div className="page-placeholder__icon">Guides</div>
      <h1 className="page-placeholder__title">How to use Graf</h1>
      <p className="page-placeholder__description">
        Learn the basics of plotting qualitative data, configuring axes, and
        discovering pattern insights.
      </p>
      
      {/* Placeholder links that will eventually point to specific guide sections */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', justifyContent: 'center', marginTop: 'var(--space-4)' }}>
        <Link to="/setup" className="nav__link" style={{ background: 'var(--color-bg-muted)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-4)', height: 'auto', border: 'none' }}>Getting Started</Link>
        <Link to="/play" className="nav__link" style={{ background: 'var(--color-bg-muted)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-4)', height: 'auto', border: 'none' }}>Canvas Controls</Link>
      </div>
      
      <div className="page-placeholder__badge" style={{ marginTop: 'var(--space-4)' }}>Phase 8</div>
    </div>
  );
}
