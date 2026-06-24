import { useState } from "react";
import Alert from "../components/Alert";
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";
import { getReferansNo } from "../utils/statusHelpers";
import "./CustomerStatus.css";

function CustomerStatus({ devices, setDevices, customerId, onBack }) {
  const [toast, setToast] = useState("");
  const [confirm, setConfirm] = useState(null);

  if (!customerId) {
    return (
      <div className="customer-container">
        <Alert message="Lütfen müşteri ID giriniz." type="error" />
        <button type="button" className="customer-btn" onClick={onBack}>
          Girişe Dön
        </button>
      </div>
    );
  }

  const device = devices.find((d) => String(d.id) === String(customerId));

  if (!device) {
    return (
      <div className="customer-container">
        <h3 className="not-found">Cihaz bulunamadı</h3>
        <p className="not-found-hint">Takip numaranızı kontrol edip tekrar deneyin.</p>
        <button type="button" className="customer-btn" onClick={onBack}>
          Girişe Dön
        </button>
      </div>
    );
  }

  const approve = () => {
    setConfirm({
      message: "Onarımı onaylamak istediğinize emin misiniz?",
      onConfirm: () => {
        setDevices(
          devices.map((d) =>
            d.id === device.id
              ? {
                  ...d,
                  durum: "Onaylandı",
                  history: [
                    ...(d.history || []),
                    { step: "Onaylandı", date: new Date().toLocaleString("tr-TR") },
                  ],
                }
              : d
          )
        );
        setToast("Onayınız kaydedildi. Teşekkürler.");
        setConfirm(null);
      },
    });
  };

  const reject = () => {
    setConfirm({
      message: "Teklifi reddetmek istediğinize emin misiniz?",
      confirmLabel: "Reddet",
      onConfirm: () => {
        setDevices(
          devices.map((d) =>
            d.id === device.id
              ? {
                  ...d,
                  durum: "Reddedildi",
                  history: [
                    ...(d.history || []),
                    { step: "Reddedildi", date: new Date().toLocaleString("tr-TR") },
                  ],
                }
              : d
          )
        );
        setToast("Teklif reddedildi.");
        setConfirm(null);
      },
    });
  };

  const steps = [
    "Cihaz Alındı",
    "Beklemede",
    "İnceleniyor",
    "Onay Bekliyor",
    "Onaylandı",
    "Tamirde",
    "Hazır",
    "Teslim Edildi",
  ];

  return (
    <div className="customer-container">
      <h2>Cihaz Takip</h2>

      <Alert message={toast} type="success" onClose={() => setToast("")} />

      <div className="customer-card">
        <div className="customer-card__row customer-card__row--referans">
          <span>Referans No</span>
          <div className="customer-ref-block">
            <strong className="customer-ref-no">{getReferansNo(device)}</strong>
          </div>
        </div>
        {device.adSoyad && (
          <div className="customer-card__row">
            <span>Müşteri</span>
            <strong>{device.adSoyad}</strong>
          </div>
        )}
        <div className="customer-card__row">
          <span>Cihaz</span>
          <strong>
            {device.cihazTuru && `${device.cihazTuru} · `}
            {device.marka} {device.model}
          </strong>
        </div>
        <div className="customer-card__row">
          <span>İşlem / Arıza</span>
          <strong>{device.islem || device.arizaNot || "—"}</strong>
        </div>
        <div className="customer-card__row">
          <span>Fiyat</span>
          <strong>{device.fiyat || 0} ₺</strong>
        </div>
        <div className="customer-card__row">
          <span>Durum</span>
          <StatusBadge durum={device.durum} />
        </div>

        <div className="timeline">
          {steps.map((step, index) => {
            const done = device.history?.find((h) => h.step === step);
            return (
              <div key={index} className={`step ${done ? "active" : ""}`}>
                <div className="circle" />
                <div className="label">
                  {step}
                  {done && <span className="date">{done.date}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {device.durum === "Onay Bekliyor" && (
          <div className="buttons">
            <button type="button" className="approve" onClick={approve}>
              Onayla
            </button>
            <button type="button" className="reject" onClick={reject}>
              Reddet
            </button>
          </div>
        )}
      </div>

      <button type="button" className="customer-btn customer-btn--outline" onClick={onBack}>
        Girişe Dön
      </button>

      <ConfirmModal
        open={!!confirm}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel || "Evet"}
        onConfirm={confirm?.onConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

export default CustomerStatus;
