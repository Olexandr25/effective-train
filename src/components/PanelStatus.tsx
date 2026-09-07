// Shared loading/error UI for a data panel. Pairs with useFetchResource:
// render this when loading or error is truthy, and the panel's real
// content otherwise. Removes the last bit of copy-pasted panel markup
// (see docs/refactor-plan.md, Exercise 1, target #2).

interface PanelStatusProps {
  title: string;
  loading: boolean;
  error: string;
  loadingMessage: string;
  onRetry: () => void;
}

export default function PanelStatus({ title, loading, error, loadingMessage, onRetry }: PanelStatusProps) {
  if (loading) {
    return (
      <section className="panel">
        <h2>{title}</h2>
        <div className="panel-loading">
          <div className="spinner" />
          <p>{loadingMessage}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>{title}</h2>
      <div className="panel-error">
        <p>⚠ {error}</p>
        <button onClick={onRetry}>Retry</button>
      </div>
    </section>
  );
}
