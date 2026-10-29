import "./IntegrationCard.css";

// One integration as a card that opens on its header; the header says how it stands. Cards share a name,
// so opening one closes the others (an exclusive <details> accordion).
export default function IntegrationCard({ title, status, children }) {
  return <details className="integration-card" name="integrations">
    <summary>
      <span className="integration-card-title">{title}</span>
      {status && <span className="integration-card-status" data-tone={status.tone}>{status.text}</span>}
    </summary>
    <div className="integration-card-body">{children}</div>
  </details>;
}
