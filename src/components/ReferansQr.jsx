import { QRCodeSVG } from "qrcode.react";
import "./ReferansQr.css";

function ReferansQr({ value, size = 96, label = "Referans QR kodu" }) {
  if (!value) return null;

  return (
    <div className="referans-qr" aria-label={`${label}: ${value}`}>
      <QRCodeSVG value={String(value)} size={size} role="img" aria-hidden="true" />
      <span className="referans-qr__hint">Takip için tarayın</span>
    </div>
  );
}

export default ReferansQr;
