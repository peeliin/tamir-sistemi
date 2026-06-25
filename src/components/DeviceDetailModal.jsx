import React, { useState } from "react";
import StatusBadge from "./StatusBadge";
import { getReferansNo, deriveOverallStatusFromArizalar } from "../utils/statusHelpers";
import "./DeviceDetailModal.css";

function DeviceDetailModal({ device, onClose, onUpdate }) {
  const [selectedArizaId, setSelectedArizaId] = useState(null);
  const [islemInput, setIslemInput] = useState("");
  const [fiyatInput, setFiyatInput] = useState(0);
  const [error, setError] = useState("");

  const arizalar = device.arizalar || [];

  // Find the first fault that is not completed (Tamamlandı) and not rejected (Reddedildi)
  const activeAriza = arizalar.find(
    (a) => a.durum !== "Tamamlandı" && a.durum !== "Reddedildi"
  );

  const handleSelectAriza = (ariza) => {
    if (activeAriza && activeAriza.id !== ariza.id) {
      // Admin can only edit the active fault step-by-step
      return;
    }
    setSelectedArizaId(ariza.id);
    setIslemInput(ariza.islem || "");
    setFiyatInput(ariza.fiyat || 0);
    setError("");
  };

  const handleSendPrice = (arizaId) => {
    setError("");
    const price = Number(fiyatInput);
    if (price <= 0) {
      setError("Lütfen geçerli bir fiyat giriniz.");
      return;
    }

    if (!islemInput.trim()) {
      setError("Lütfen yapılacak işlemi yazınız.");
      return;
    }

    const updatedArizalar = arizalar.map((a) => {
      if (a.id === arizaId) {
        return {
          ...a,
          fiyat: price,
          islem: islemInput.trim(),
          durum: "Onay Bekliyor",
          bildirimYapildi: true,
        };
      }
      return a;
    });

    // Update overall device status to 'Onay Bekliyor'
    const updatedDevice = {
      ...device,
      arizalar: updatedArizalar,
      durum: "Onay Bekliyor",
      history: [
        ...(device.history || []),
        {
          step: "Onay Bekliyor",
          date: new Date().toLocaleString("tr-TR"),
          note: `Arıza #${arizaId} için fiyat bildirildi: ${price} ₺`,
        },
      ],
    };

    onUpdate(updatedDevice);
    setSelectedArizaId(null);
  };

  const handleCompleteRepair = (arizaId) => {
    const updatedArizalar = arizalar.map((a) => {
      if (a.id === arizaId) {
        return {
          ...a,
          durum: "Tamamlandı",
        };
      }
      return a;
    });

    const overallStatus = deriveOverallStatusFromArizalar(updatedArizalar, device.durum);

    const updatedDevice = {
      ...device,
      arizalar: updatedArizalar,
      durum: overallStatus,
      history: [
        ...(device.history || []),
        {
          step: overallStatus,
          date: new Date().toLocaleString("tr-TR"),
          note: `Arıza #${arizaId} tamamlandı.`,
        },
      ],
    };

    onUpdate(updatedDevice);
    setSelectedArizaId(null);
  };

  // Simulation helper for the admin to approve customer proposal
  const simulateCustomerApproval = (arizaId, approve) => {
    const updatedArizalar = arizalar.map((a) => {
      if (a.id === arizaId) {
        return {
          ...a,
          onayli: approve,
          durum: approve ? "Başlandı" : "Reddedildi",
        };
      }
      return a;
    });

    const hasActive = updatedArizalar.some((a) => a.durum === "Başlandı");
    const overallStatus = hasActive ? "Tamirde" : "Beklemede";

    const updatedDevice = {
      ...device,
      arizalar: updatedArizalar,
      durum: overallStatus,
      history: [
        ...(device.history || []),
        {
          step: overallStatus,
          date: new Date().toLocaleString("tr-TR"),
          note: `Müşteri arıza #${arizaId} için onay ${approve ? "verdi (Simüle)" : "vermedi (Simüle)"}.`,
        },
      ],
    };

    onUpdate(updatedDevice);
    setSelectedArizaId(null);
  };

  return (
    <div className="modal-backdrop">
      <div className="detail-modal">
        <div className="detail-modal__header">
          <h3>Cihaz Detay ve Arıza Checklist</h3>
          <button type="button" className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="detail-modal__info">
          <p>
            <strong>Referans No:</strong> {getReferansNo(device)}
          </p>
          <p>
            <strong>Müşteri:</strong> {device.adSoyad}
          </p>
          <p>
            <strong>Telefon:</strong> {device.telefon}
          </p>
          <p>
            <strong>E-posta:</strong> {device.email}
          </p>
          <p>
            <strong>Cihaz:</strong> {device.marka} {device.model} ({device.cihazTuru})
          </p>
          <p>
            <strong>Genel Durum:</strong> <StatusBadge durum={device.durum} />
          </p>
        </div>

        <div className="checklist-section">
          <h4>Arıza Listesi (Adım Adım Süreç)</h4>
          <p className="checklist-hint">
            * Servis işlemlerini sırayla tamamlamanız gerekmektedir. Aktif olan arızanın fiyatı bildirildikten sonra kilitlenir.
          </p>

          <ul className="ariza-checklist">
            {arizalar.map((ariza, index) => {
              const isActive = activeAriza && activeAriza.id === ariza.id;
              const isLocked = activeAriza && ariza.id > activeAriza.id;
              const isDone = ariza.durum === "Tamamlandı";
              const isSelected = selectedArizaId === ariza.id;

              let itemClass = "ariza-item";
              if (isActive) itemClass += " ariza-item--active";
              if (isLocked) itemClass += " ariza-item--locked";
              if (isDone) itemClass += " ariza-item--done";

              return (
                <li key={ariza.id} className={itemClass}>
                  <div className="ariza-item__main" onClick={() => !isLocked && handleSelectAriza(ariza)}>
                    <div className="ariza-item__left">
                      <span className="ariza-number">#{index + 1}</span>
                      <span className="ariza-text">{ariza.arizaNot}</span>
                    </div>
                    <div className="ariza-item__right">
                      {ariza.fiyat > 0 && <span className="ariza-price">{ariza.fiyat} ₺</span>}
                      <StatusBadge durum={ariza.durum} />
                    </div>
                  </div>

                  {isSelected && (
                    <div className="ariza-edit-panel">
                      {error && <p className="ariza-error">{error}</p>}
                      
                      <div className="ariza-field-row">
                        <label>
                          Yapılan İşlem:
                          <input
                            type="text"
                            value={islemInput}
                            onChange={(e) => setIslemInput(e.target.value)}
                            placeholder="Örn: Ekran değişimi"
                            disabled={ariza.bildirimYapildi}
                          />
                        </label>
                      </div>

                      <div className="ariza-field-row">
                        <label>
                          Fiyat (₺):
                          <input
                            type="number"
                            value={fiyatInput}
                            onChange={(e) => setFiyatInput(e.target.value)}
                            disabled={ariza.bildirimYapildi}
                          />
                        </label>
                      </div>

                      <div className="ariza-actions-row">
                        {!ariza.bildirimYapildi ? (
                          <button
                            type="button"
                            className="ariza-action-btn ariza-action-btn--send"
                            onClick={() => handleSendPrice(ariza.id)}
                          >
                            Fiyat Bildir
                          </button>
                        ) : (
                          <div className="price-locked-msg">
                            🔒 Fiyat bildirildi ve kilitlendi.
                          </div>
                        )}

                        {ariza.bildirimYapildi && ariza.onayli === null && (
                          <div className="sim-approval-row">
                            <span className="wait-msg">Müşteri onayı bekleniyor...</span>
                            <div className="sim-buttons">
                              <button
                                type="button"
                                className="sim-btn sim-btn--ok"
                                onClick={() => simulateCustomerApproval(ariza.id, true)}
                              >
                                Evet (Müşteri Onayladı)
                              </button>
                              <button
                                type="button"
                                className="sim-btn sim-btn--no"
                                onClick={() => simulateCustomerApproval(ariza.id, false)}
                              >
                                Hayır (Müşteri Reddetti)
                              </button>
                            </div>
                          </div>
                        )}

                        {ariza.durum === "Başlandı" && (
                          <button
                            type="button"
                            className="ariza-action-btn ariza-action-btn--complete"
                            onClick={() => handleCompleteRepair(ariza.id)}
                          >
                            Tamamla
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DeviceDetailModal;
