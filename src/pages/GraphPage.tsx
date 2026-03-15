import { useParams } from 'react-router-dom';

export default function GraphPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="page-placeholder">
      <div className="page-placeholder__icon">Graph</div>
      <h1 className="page-placeholder__title">Graph View</h1>
      <p className="page-placeholder__description">
        Interactive canvas for graph <code>{id}</code>. Tap to plot, drag to
        move, pinch to zoom.
      </p>
      <div className="page-placeholder__badge">Phase 1–2</div>
    </div>
  );
}
