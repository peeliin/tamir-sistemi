import NegotiationChat from "./NegotiationChat";
import { getReferansNo } from "../utils/statusHelpers";
import "./NegotiationChat.css";

function NegotiationModal({ device, isAdmin, onUpdate, onClose }) {
  if (!device) return null;

  return (
    <div className="negotiation-modal-overlay" onClick={onClose}>
      <div className="negotiation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="negotiation-modal__head">
          <h3>
            Pazarlık — {getReferansNo(device)}
            {device.adSoyad && ` · ${device.adSoyad}`}
          </h3>
          <button
            type="button"
            className="negotiation-modal__close"
            onClick={onClose}
            aria-label="Kapat"
          >
            ×
          </button>
        </div>
        <NegotiationChat device={device} isAdmin={isAdmin} onUpdate={onUpdate} />
      </div>
    </div>
  );
}

export default NegotiationModal;
