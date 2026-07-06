export default function SuccessAlert({ message }) {
  if (!message) return null;
  return <div className="alert alert-success">{message}</div>;
}
