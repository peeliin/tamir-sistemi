import { useState, useRef, useEffect } from "react";
import {
  MAX_DISCOUNT_PERCENT,
  calcDiscountedPrice,
  createMessage,
  getLatestPendingCounterOffer,
  getLatestPendingDiscountRequest,
} from "../utils/negotiationHelpers";
import "./NegotiationChat.css";

function NegotiationChat({ device, isAdmin, onUpdate }) {
  const [text, setText] = useState("");
  const [offerPriceInput, setOfferPriceInput] = useState(device.fiyat || 0);
  const [counterPrice, setCounterPrice] = useState(device.fiyat || 0);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const messages = device.messages || [];
  const originalPrice = Number(device.fiyat) || 0;
  const minOfferPrice =
    originalPrice > 0 ? calcDiscountedPrice(originalPrice, MAX_DISCOUNT_PERCENT) : 1;
  const pendingRequest = getLatestPendingDiscountRequest(messages);
  const pendingCounter = !isAdmin ? getLatestPendingCounterOffer(messages) : null;
  const canNegotiate = device.durum === "Onay Bekliyor";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    setCounterPrice(device.fiyat || 0);
    setOfferPriceInput(device.fiyat || 0);
  }, [device.fiyat, device.id]);

  useEffect(() => {
    const msgs = device.messages || [];
    if (isAdmin && msgs.some((m) => m.sender === "customer" && !m.readByAdmin)) {
      const updatedMessages = msgs.map((m) =>
        m.sender === "customer" && !m.readByAdmin ? { ...m, readByAdmin: true } : m
      );
      onUpdate({
        ...device,
        messages: updatedMessages,
      });
    }
  }, [isAdmin, device.messages, device, onUpdate]);

  const updateDevice = (nextMessages, extra = {}) => {
    onUpdate({
      ...device,
      ...extra,
      messages: nextMessages,
    });
  };

  const appendMessages = (newMsgs, extra = {}) => {
    updateDevice([...messages, ...newMsgs], extra);
  };

  const sendText = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    appendMessages([
      createMessage({
        sender: isAdmin ? "admin" : "customer",
        type: "text",
        text: trimmed,
      }),
    ]);
    setText("");
    setError("");
  };

  const sendDiscountRequest = (e) => {
    e.preventDefault();
    if (!canNegotiate) return;

    const targetPrice = Number(offerPriceInput);
    if (targetPrice <= 0 || targetPrice >= originalPrice) {
      setError(`Teklifiniz 0 ile orijinal fiyat (${originalPrice} ₺) arasında olmalıdır.`);
      return;
    }

    if (targetPrice < minOfferPrice) {
      setError(
        `En fazla %${MAX_DISCOUNT_PERCENT} indirim talep edebilirsiniz. Minimum teklif: ${minOfferPrice} ₺`
      );
      return;
    }

    if (pendingRequest) {
      setError("Bekleyen bir indirim talebiniz var. Admin yanıtını bekleyin.");
      return;
    }

    const pct = Math.min(
      MAX_DISCOUNT_PERCENT,
      Math.round(((originalPrice - targetPrice) / originalPrice) * 100)
    );

    const msgText = text.trim() || `${targetPrice} ₺ net fiyat teklif ediyorum.`;

    appendMessages([
      createMessage({
        sender: "customer",
        type: "discount_request",
        text: msgText,
        discountPercent: pct,
        originalPrice,
        requestedPrice: targetPrice,
        resolved: false,
      }),
    ]);
    setText("");
    setError("");
  };

  const markResolved = (requestId) =>
    messages.map((m) => (m.id === requestId ? { ...m, resolved: true } : m));

  const adminApproveDiscount = (request) => {
    updateDevice(
      [
        ...markResolved(request.id),
        createMessage({
          sender: "admin",
          type: "admin_decision",
          decision: "approved",
          text: `İndirim onaylandı. Yeni fiyat: ${request.requestedPrice} ₺`,
          offerPrice: request.requestedPrice,
          linkedRequestId: request.id,
        }),
      ],
      { fiyat: request.requestedPrice }
    );
    setText("");
    setError("");
  };

  const adminRejectDiscount = (request) => {
    const note = text.trim() || "İndirim talebiniz reddedildi.";
    updateDevice([
      ...markResolved(request.id),
      createMessage({
        sender: "admin",
        type: "admin_decision",
        decision: "rejected",
        text: note,
        linkedRequestId: request.id,
      }),
    ]);
    setText("");
    setError("");
  };

  const adminSendCounterOffer = (request = null) => {
    const price = Number(counterPrice);
    if (!price || price <= 0) {
      setError("Geçerli bir fiyat girin.");
      return;
    }

    const note = text.trim() || `Yeni teklif: ${price} ₺`;
    const resolved = request ? markResolved(request.id) : messages;

    updateDevice([
      ...resolved,
      createMessage({
        sender: "admin",
        type: "admin_decision",
        decision: "counter_offer",
        text: note,
        offerPrice: price,
        originalPrice,
        linkedRequestId: request?.id,
        resolved: false,
      }),
    ]);
    setText("");
    setError("");
  };

  const customerAcceptCounter = (offer) => {
    updateDevice(
      [
        ...messages.map((m) => (m.id === offer.id ? { ...m, resolved: true } : m)),
        createMessage({
          sender: "customer",
          type: "text",
          text: `Yeni teklifi kabul ediyorum (${offer.offerPrice} ₺).`,
        }),
      ],
      { fiyat: offer.offerPrice }
    );
  };

  const renderMessageBody = (msg) => {
    if (msg.type === "discount_request") {
      return (
        <div className="chat-bubble__offer">
          <strong>İndirim Talebi</strong>
          <p>{msg.text}</p>
          <div className="chat-bubble__price-row">
            <span>Mevcut: {msg.originalPrice} ₺</span>
            <span className="chat-bubble__highlight">Teklif Edilen: {msg.requestedPrice} ₺</span>
          </div>
          {isAdmin && !msg.resolved && canNegotiate && (
            <div className="chat-bubble__actions">
              <button type="button" className="chat-btn chat-btn--approve" onClick={() => adminApproveDiscount(msg)}>
                Onayla
              </button>
              <button type="button" className="chat-btn chat-btn--reject" onClick={() => adminRejectDiscount(msg)}>
                Reddet
              </button>
            </div>
          )}
        </div>
      );
    }

    if (msg.type === "admin_decision") {
      const labels = {
        approved: "İndirim Onaylandı",
        rejected: "Talep Reddedildi",
        counter_offer: "Yeni Teklif",
      };
      return (
        <div className="chat-bubble__offer">
          <strong>{labels[msg.decision] || "Admin Yanıtı"}</strong>
          <p>{msg.text}</p>
          {msg.offerPrice != null && (
            <div className="chat-bubble__price-row">
              <span className="chat-bubble__highlight">{msg.offerPrice} ₺</span>
            </div>
          )}
          {!isAdmin && msg.decision === "counter_offer" && !msg.resolved && canNegotiate && (
            <div className="chat-bubble__actions">
              <button type="button" className="chat-btn chat-btn--approve" onClick={() => customerAcceptCounter(msg)}>
                Teklifi Kabul Et
              </button>
            </div>
          )}
        </div>
      );
    }

    return <p>{msg.text}</p>;
  };

  return (
    <div className="negotiation-chat">
      <div className="negotiation-chat__header">
        <h3>Fiyat Pazarlığı</h3>
        <span className="negotiation-chat__price">Güncel fiyat: <strong>{originalPrice} ₺</strong></span>
      </div>

      {!canNegotiate && (
        <p className="negotiation-chat__notice">
          Pazarlık yalnızca &quot;Onay Bekliyor&quot; durumunda yapılabilir.
        </p>
      )}

      <div className="negotiation-chat__messages">
        {messages.length === 0 && (
          <p className="negotiation-chat__empty">Henüz mesaj yok. Fiyat hakkında yazışmaya başlayın.</p>
        )}
        {messages.map((msg) => {
          const isMe = isAdmin ? msg.sender === "admin" : msg.sender === "customer";
          const senderName = isMe 
            ? "Siz" 
            : (isAdmin ? "Müşteri" : "Tekniker");

          return (
            <div
              key={msg.id}
              className={`chat-bubble chat-bubble--${isMe ? "me" : "them"} chat-bubble--${msg.type}`}
            >
              <span className="chat-bubble__meta">
                {senderName} · {msg.date}
              </span>
              {renderMessageBody(msg)}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {error && <p className="negotiation-chat__error">{error}</p>}

      {canNegotiate && !isAdmin && pendingCounter && (
        <div className="negotiation-chat__pending">
          Bekleyen admin teklifi: <strong>{pendingCounter.offerPrice} ₺</strong>
        </div>
      )}

      {canNegotiate && (
        <div className="negotiation-chat__composer">
          {!isAdmin && (
            <div className="negotiation-chat__discount">
              <label htmlFor="offer-price-input">
                Teklif Etmek İstediğiniz Net Fiyat (₺)
              </label>
              <div className="negotiation-chat__discount-row" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                  id="offer-price-input"
                  type="number"
                  min={minOfferPrice}
                  max={originalPrice > 1 ? originalPrice - 1 : 1}
                  value={offerPriceInput}
                  onChange={(e) => setOfferPriceInput(Number(e.target.value))}
                  disabled={!!pendingRequest}
                  style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", width: "120px" }}
                />
                <span className="negotiation-chat__discount-preview" style={{ color: "#4b5563", fontSize: "14px" }}>
                  Orijinal: {originalPrice} ₺ · Maks. indirim: %{MAX_DISCOUNT_PERCENT} · Min. teklif: {minOfferPrice} ₺
                </span>
              </div>
            </div>
          )}

          {isAdmin && pendingRequest && (
            <div className="negotiation-chat__admin-counter">
              <label htmlFor="counter-price">Karşı teklif (₺)</label>
              <input
                id="counter-price"
                type="number"
                min="1"
                value={counterPrice}
                onChange={(e) => setCounterPrice(e.target.value)}
              />
              <button
                type="button"
                className="chat-btn chat-btn--offer"
                onClick={() => adminSendCounterOffer(pendingRequest)}
              >
                Yeni Teklif Gönder
              </button>
            </div>
          )}

          {isAdmin && !pendingRequest && (
            <div className="negotiation-chat__admin-counter">
              <label htmlFor="counter-price-free">Yeni fiyat teklifi (₺)</label>
              <input
                id="counter-price-free"
                type="number"
                min="1"
                value={counterPrice}
                onChange={(e) => setCounterPrice(e.target.value)}
              />
              <button
                type="button"
                className="chat-btn chat-btn--offer"
                onClick={() => adminSendCounterOffer()}
              >
                Teklif Gönder
              </button>
            </div>
          )}

          <form className="negotiation-chat__form" onSubmit={sendText}>
            <input
              type="text"
              placeholder={!isAdmin && !!pendingRequest ? "Admin yanıtı bekleniyor..." : (isAdmin ? "Müşteriye mesaj yazın..." : "Mesajınızı yazın...")}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={!isAdmin && !!pendingRequest}
            />
            <button type="submit" className="chat-btn chat-btn--send" disabled={!isAdmin && !!pendingRequest}>
              Gönder
            </button>
          </form>

          {!isAdmin && (
            <button
              type="button"
              className="chat-btn chat-btn--discount"
              onClick={sendDiscountRequest}
              disabled={!!pendingRequest}
            >
              Teklifi Gönder
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default NegotiationChat;
