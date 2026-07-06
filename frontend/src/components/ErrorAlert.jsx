export default function ErrorAlert({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="alert alert-error">
      <span>{message}</span>
      {onClose && (
        <button className="alert-close" onClick={onClose}>&times;</button>
      )}
    </div>
  );
}
