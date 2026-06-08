import "./ConfirmModal.css";

function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmLabel = "Evet" }) {
  if (!open) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title || "Onay"}</h3>
        <p>{message || "Bu işlemi yapmak istediğinize emin misiniz?"}</p>
        <div className="confirm-modal__actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            İptal
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
