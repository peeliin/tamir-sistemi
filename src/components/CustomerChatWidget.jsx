import { useState } from "react";
import NegotiationChat from "./NegotiationChat";
import "./CustomerChatWidget.css";

function CustomerChatWidget({ device, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("menu");
  const [statusMessages, setStatusMessages] = useState([]);

  const closeWidget = () => {
    setOpen(false);
    setMode("menu");
  };

  const QUESTIONS = [
    { key: "durum", text: "1- Cihazımın durumu nedir?" },
    { key: "fiyat", text: "2- Tamir fiyatı nedir?" },
    { key: "teslim", text: "3- Cihaz ne zaman teslim edilecek?" }
  ];

  const handleStatusQuery = () => {
    const now = new Date().toLocaleString("tr-TR");
    setStatusMessages([
      {
        id: "welcome",
        sender: "system",
        text: "Merhaba! Ben otomatik destek asistanıyım. Cihazınız hakkında bilgi almak için aşağıdaki hazır sorulardan birini seçebilirsiniz:",
        date: now,
      },
    ]);
    setMode("status");
  };

  const handleQuestionSelect = (q) => {
    const now = new Date().toLocaleString("tr-TR");
    
    let answerText = "";
    if (q.key === "durum") {
      switch (device.durum) {
        case "Cihaz Alındı":
        case "Beklemede":
          answerText = "Cihazınız teknik servisimize alınmıştır ve şu an işlem sırası beklemektedir (Beklemede).";
          break;
        case "İnceleniyor":
          answerText = "Cihazınız şu an teknisyenlerimiz tarafından detaylı incelenmektedir (İnceleniyor).";
          break;
        case "Onay Bekliyor":
          answerText = "Cihazınızın arıza tespiti yapılmış olup tarafınızdan fiyat onayı beklenmektedir (Onay Bekliyor).";
          break;
        case "Onaylandı":
        case "Başlandı":
        case "Tamirde":
          answerText = "Cihazınız onaylanmış olup tamir sürecine başlanmıştır ve işlemleri devam etmektedir (Tamirde).";
          break;
        case "Hazır":
          answerText = "Cihazınızın tamir işlemleri başarıyla tamamlanmıştır. Cihazınız teslim alınmaya hazırdır (Hazır).";
          break;
        case "Teslim Edildi":
          answerText = "Cihazınız teslim edilmiştir (Teslim Edildi).";
          break;
        case "Reddedildi":
          answerText = "Cihaz tamir teklifi tarafınızdan reddedilmiştir (Reddedildi).";
          break;
        default:
          answerText = `Cihazınızın güncel durumu: ${device.durum}`;
      }
    } else if (q.key === "fiyat") {
      answerText = device.fiyat > 0 
        ? `Cihazınız için belirlenen güncel tamir bedeli: ${device.fiyat} ₺'dir.`
        : "Cihazınızın arıza tespit işlemleri tamamlandıktan sonra fiyat bilgisi paylaşılacaktır.";
    } else if (q.key === "teslim") {
      if (device.durum === "Hazır") {
        answerText = "Cihazınız hazır durumdadır, çalışma saatlerimiz içerisinde dilediğiniz zaman teslim alabilirsiniz.";
      } else if (device.durum === "Tamirde" || device.durum === "Başlandı" || device.durum === "Onaylandı") {
        answerText = "Cihazınız şu an tamir aşamasındadır. Genellikle 1-2 iş günü içerisinde tamamlanması hedeflenmektedir.";
      } else {
        answerText = "Cihazınızın durumuna göre teslimat süresi belirlenecektir. İnceleme tamamlandıktan sonra size bilgi verilecektir.";
      }
    }

    setStatusMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "customer",
        text: q.text,
        date: now,
      },
      {
        id: `system-${Date.now()}`,
        sender: "system",
        text: answerText,
        date: now,
      }
    ]);
  };

  return (
    <div className="customer-chat-widget">
      {open && (
        <div className="customer-chat-widget__panel">
          {mode === "menu" && (
            <>
              <div className="customer-chat-widget__head">
                <h4>Destek</h4>
                <button
                  type="button"
                  className="customer-chat-widget__close"
                  onClick={closeWidget}
                  aria-label="Kapat"
                >
                  ×
                </button>
              </div>
              <div className="customer-chat-widget__menu">
                <button
                  type="button"
                  className="customer-chat-widget__option"
                  onClick={() => setMode("negotiation")}
                >
                  <strong>Pazarlık</strong>
                  <span>Fiyat indirimi talep edin veya mesajlaşın</span>
                </button>
                <button
                  type="button"
                  className="customer-chat-widget__option customer-chat-widget__option--auto"
                  onClick={handleStatusQuery}
                >
                  <strong>Oto cevap: Cihaz durumu sorgula</strong>
                  <span>Anlık cihaz durumu ve süreç özeti</span>
                </button>
              </div>
            </>
          )}

          {mode === "negotiation" && (
            <>
              <div className="customer-chat-widget__head">
                <button
                  type="button"
                  className="customer-chat-widget__back"
                  onClick={() => setMode("menu")}
                >
                  ← Geri
                </button>
                <button
                  type="button"
                  className="customer-chat-widget__close"
                  onClick={closeWidget}
                  aria-label="Kapat"
                >
                  ×
                </button>
              </div>
              <NegotiationChat
                device={device}
                isAdmin={false}
                onUpdate={onUpdate}
              />
            </>
          )}

          {mode === "status" && (
            <>
              <div className="customer-chat-widget__head">
                <button
                  type="button"
                  className="customer-chat-widget__back"
                  onClick={() => setMode("menu")}
                >
                  ← Geri
                </button>
                <span className="customer-chat-widget__title">Otomatik Asistan</span>
                <button
                  type="button"
                  className="customer-chat-widget__close"
                  onClick={closeWidget}
                  aria-label="Kapat"
                >
                  ×
                </button>
              </div>
              <div className="customer-chat-widget__messages">
                {statusMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`customer-chat-widget__bubble customer-chat-widget__bubble--${msg.sender}`}
                  >
                    <span className="customer-chat-widget__meta">
                      {msg.sender === "system"
                        ? "Otomatik Asistan"
                        : "Siz"} · {msg.date}
                    </span>
                    <p className="customer-chat-widget__text">{msg.text}</p>
                  </div>
                ))}
              </div>
              <div className="customer-chat-widget__quick-replies" style={{ padding: "12px", borderTop: "1px solid #e5e7eb", background: "#f8fafc", display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Sorulabilecek Sorular:</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {QUESTIONS.map((q) => (
                    <button
                      key={q.key}
                      type="button"
                      onClick={() => handleQuestionSelect(q)}
                      style={{
                        background: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontSize: "12.5px",
                        textAlign: "left",
                        cursor: "pointer",
                        color: "#2563eb",
                        fontWeight: "500",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                        transition: "all 0.15s ease",
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = "#f1f5f9";
                        e.target.style.borderColor = "#cbd5e1";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = "white";
                        e.target.style.borderColor = "#e2e8f0";
                      }}
                    >
                      {q.text}
                    </button>
                  ))}
                </div>
              </div>
              <div className="customer-chat-widget__status-footer">
                <button
                  type="button"
                  className="customer-chat-widget__refresh"
                  onClick={handleStatusQuery}
                >
                  Durumu yenile
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <button
        type="button"
        className="customer-chat-widget__fab"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Sohbet"
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      </button>
    </div>
  );
}

export default CustomerChatWidget;
