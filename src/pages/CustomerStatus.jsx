import { useState } from "react";
import Alert from "../components/Alert";
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";
import CustomerChatWidget from "../components/CustomerChatWidget";
import { getReferansNo, deriveOverallStatusFromArizalar } from "../utils/statusHelpers";
import "./CustomerStatus.css";

function CustomerStatus({ devices, setDevices, customerId, onBack }) {
  const [toast, setToast] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [rejectMode, setRejectMode] = useState({ active: false, arizaId: null });

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
    setRejectMode({ active: true, arizaId: null });
  };

  const handleFinalReject = (arizaId = null) => {
    setConfirm({
      message: "İptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      confirmLabel: "İptal Et",
      onConfirm: () => {
        if (arizaId) {
          const updatedArizalar = device.arizalar?.map((a) => {
            if (a.id === arizaId) return { ...a, onayli: false, durum: "Reddedildi" };
            return a;
          }) || [];
          const overallStatus = deriveOverallStatusFromArizalar(updatedArizalar, "Beklemede");

          setDevices(devices.map((d) => d.id === device.id ? {
            ...d,
            arizalar: updatedArizalar,
            durum: overallStatus,
            history: [...(d.history || []), { step: overallStatus, date: new Date().toLocaleString("tr-TR"), note: "Müşteri teklifi reddetti." }]
          } : d));
        } else {
          setDevices(devices.map((d) => d.id === device.id ? {
            ...d,
            durum: "Reddedildi",
            history: [...(d.history || []), { step: "Reddedildi", date: new Date().toLocaleString("tr-TR") }]
          } : d));
        }
        setToast("Teklif reddedildi ve iptal edildi.");
        setConfirm(null);
        setRejectMode({ active: false, arizaId: null });
      },
    });
  };

  const handleNegotiate = () => {
    setRejectMode({ active: false, arizaId: null });
    setToast("Sohbet ekranından pazarlık yapabilirsiniz.");
    // Sohbet penceresini açmak veya odaklanmak için
    const chatHeader = document.querySelector(".customer-chat-widget__header");
    if (chatHeader) chatHeader.click();
  };

  const handleCustomerApproveAriza = (arizaId) => {
    const updatedArizalar = device.arizalar?.map((a) => {
      if (a.id === arizaId) {
        return {
          ...a,
          onayli: true,
          durum: "Başlandı",
        };
      }
      return a;
    }) || [];

    const hasActive = updatedArizalar.some((a) => a.durum === "Başlandı");
    const overallStatus = hasActive ? "Tamirde" : "Beklemede";

    setDevices(
      devices.map((d) =>
        d.id === device.id
          ? {
              ...d,
              arizalar: updatedArizalar,
              durum: overallStatus,
              history: [
                ...(d.history || []),
                {
                  step: overallStatus,
                  date: new Date().toLocaleString("tr-TR"),
                  note: `Müşteri arıza #${arizaId} için teklifi onayladı.`,
                },
              ],
            }
          : d
      )
    );
    setToast("Arıza onarım teklifini onayladınız. İşlem başlatıldı.");
  };

  const handleCustomerRejectAriza = (arizaId) => {
    setRejectMode({ active: true, arizaId });
  };

  const getStatusIndex = (durum) => {
    switch (durum) {
      case "Cihaz Alındı":
        return 0;
      case "Beklemede":
        return 1;
      case "İnceleniyor":
        return 2;
      case "Onay Bekliyor":
        return 3;
      case "Onaylandı":
        return 4;
      case "Başlandı":
      case "Tamirde":
        return 5;
      case "Hazır":
        return 6;
      case "Teslim Edildi":
        return 7;
      default:
        return 1;
    }
  };

  const currentStatusIndex = getStatusIndex(device.durum);

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

  const maxHistoryIndex = Math.max(
    -1,
    ...(device.history || []).map((h) => getStatusIndex(h.step))
  );
  const activeMaxIndex = Math.max(currentStatusIndex, maxHistoryIndex);

  const hasPendingChecklistApproval = device.arizalar?.some((a) => a.bildirimYapildi && a.onayli === null);

  return (
    <div className="customer-container">
      <h2>Cihaz Takip</h2>

      <Alert message={toast} type="success" onClose={() => setToast("")} />

      <div className="customer-card">
        <div className="customer-card__row">
          <span>Referans No</span>
          <strong className="customer-ref-no">{getReferansNo(device)}</strong>
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

        {device.arizalar && device.arizalar.length > 0 && (
          <div style={{ marginTop: "24px", borderTop: "1px solid #e5e7eb", paddingTop: "16px" }}>
            <h4 style={{ margin: "0 0 12px", color: "#1e3a8a", fontSize: "15px" }}>Arıza ve Onay Checklist</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {device.arizalar.map((ariza, index) => (
                <li key={ariza.id} style={{ border: "1px solid #e5e7eb", padding: "12px", borderRadius: "8px", background: "#f8fafc" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontSize: "14px", color: "#374151" }}>#{index + 1}: {ariza.arizaNot}</strong>
                      {ariza.fiyat > 0 && (
                        <div style={{ fontSize: "13px", color: "#059669", marginTop: "4px" }}>
                          Teklif Edilen Fiyat: <b>{ariza.fiyat} ₺</b>
                        </div>
                      )}
                      {ariza.islem && (
                        <div style={{ fontSize: "13px", color: "#4b5563", marginTop: "2px" }}>
                          Yapılacak İşlem: {ariza.islem}
                        </div>
                      )}
                    </div>
                    <div>
                      <StatusBadge durum={ariza.durum} />
                    </div>
                  </div>

                  {ariza.bildirimYapildi && ariza.onayli === null && (
                    <div style={{ marginTop: "12px" }}>
                      {!rejectMode.active || rejectMode.arizaId !== ariza.id ? (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            type="button"
                            style={{ background: "#16a34a", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                            onClick={() => handleCustomerApproveAriza(ariza.id)}
                          >
                            Kabul Et / Onayla
                          </button>
                          <button
                            type="button"
                            style={{ background: "#dc2626", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                            onClick={() => handleCustomerRejectAriza(ariza.id)}
                          >
                            Reddet
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "#fef2f2", padding: "10px", borderRadius: "6px", border: "1px solid #fecaca" }}>
                          <span style={{ fontSize: "12px", color: "#991b1b", fontWeight: "600" }}>Nasıl devam etmek istersiniz?</span>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button type="button" style={{ background: "#2563eb", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }} onClick={handleNegotiate}>
                              Pazarlık Yap
                            </button>
                            <button type="button" style={{ background: "#991b1b", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }} onClick={() => handleFinalReject(ariza.id)}>
                              Hayır / İptal Et
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="timeline">
          {steps.map((step, index) => {
            const done = device.history?.find((h) => h.step === step);
            const isStepActive = index <= activeMaxIndex || !!done;
            return (
              <div key={index} className={`step ${isStepActive ? "active" : ""}`}>
                <div className="circle" />
                <div className="label">
                  {step}
                  {done && <span className="date">{done.date}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {!hasPendingChecklistApproval && device.durum === "Onay Bekliyor" && (
          <div className="buttons" style={{ flexDirection: "column", gap: "10px" }}>
            {!rejectMode.active || rejectMode.arizaId !== null ? (
              <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                <button type="button" className="approve" onClick={approve}>
                  Kabul Et / Onayla
                </button>
                <button type="button" className="reject" onClick={reject}>
                  Reddet
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "#fef2f2", padding: "16px", borderRadius: "8px", border: "1px solid #fecaca" }}>
                <span style={{ fontSize: "14px", color: "#991b1b", fontWeight: "600" }}>Nasıl devam etmek istersiniz?</span>
                <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                  <button type="button" style={{ flex: 1, padding: "12px", background: "#2563eb", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }} onClick={handleNegotiate}>
                    Pazarlık Yap
                  </button>
                  <button type="button" style={{ flex: 1, padding: "12px", background: "#991b1b", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }} onClick={() => handleFinalReject(null)}>
                    Hayır / İptal Et
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <CustomerChatWidget
        device={device}
        onUpdate={(updated) => {
          setDevices(devices.map((d) => (d.id === device.id ? updated : d)));
        }}
      />

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
