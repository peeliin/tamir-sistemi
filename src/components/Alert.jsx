import "./Alert.css";

function Alert({ message, type = "error", onClose }) {
  if (!message) return null;

  return (
    <div className={`app-alert app-alert--${type}`} role="alert">
      <span>{message}</span>
      {onClose && (
        <button type="button" className="app-alert__close" onClick={onClose} aria-label="Kapat">
          ×
        </button>
      )}
    </div>
  );
}

export default Alert;
