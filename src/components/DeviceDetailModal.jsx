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
            <strong>Telefon:</strong> {device.telefon}{" "}
            <a
              href={`https://wa.me/${(() => {
                const digits = device.telefon.replace(/\D/g, "");
                if (digits.length === 10) return "90" + digits;
                if (digits.length === 11 && digits.startsWith("0")) return "90" + digits.substring(1);
                return digits;
              })()}?text=${encodeURIComponent(
                `Merhaba ${device.adSoyad},\n\nSistemimize ${getReferansNo(device)} referans numarasıyla kayıtlı olan ${device.marka} ${device.model} (${device.cihazTuru}) cihazınızın servis işlemleri ile ilgili güncel durumu şu şekildedir:\n\n📌 Güncel Durum: *${device.durum}*\n\nCihazınızın detaylı durumunu takip etmek, arıza detaylarını incelemek, teklifleri onaylamak/reddetmek veya teknisyenlerimizle anlık görüşmek için aşağıdaki müşteri takip panelini kullanabilirsiniz:\n\n🔗 Takip Linki: https://tamir-sistemi.vercel.app/\n\nHerhangi bir sorunuz olursa bu hat üzerinden bizimle iletişime geçebilirsiniz. Bizi tercih ettiğiniz için teşekkür ederiz, iyi günler dileriz.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-link"
              title="WhatsApp ile İletişime Geç"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="currentColor"
                style={{ verticalAlign: "middle", marginLeft: "4px", color: "#25D366" }}
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
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
