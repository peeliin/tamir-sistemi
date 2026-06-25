export const MAX_DISCOUNT_PERCENT = 35;

export function calcDiscountedPrice(originalPrice, discountPercent) {
  const price = Number(originalPrice) || 0;
  const pct = Math.min(MAX_DISCOUNT_PERCENT, Math.max(0, Number(discountPercent) || 0));
  return Math.round(price * (1 - pct / 100));
}

export function createMessage(payload) {
  return {
    id: Date.now() + Math.random(),
    date: new Date().toLocaleString("tr-TR"),
    readByAdmin: payload.sender === "customer" ? false : true,
    ...payload,
  };
}

export function getLatestPendingDiscountRequest(messages = []) {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const msg = messages[i];
    if (msg.type === "discount_request" && !msg.resolved) return msg;
  }
  return null;
}

export function getLatestPendingCounterOffer(messages = []) {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const msg = messages[i];
    if (
      msg.type === "admin_decision" &&
      msg.decision === "counter_offer" &&
      !msg.resolved
    ) {
      return msg;
    }
  }
  return null;
}

export function countUnreadForAdmin(messages = []) {
  return messages.filter(
    (m) => m.sender === "customer" && !m.readByAdmin
  ).length;
}

export function countAllPendingForAdmin(devices = []) {
  return devices.reduce((sum, d) => sum + countUnreadForAdmin(d.messages), 0);
}

export function getDevicesWithPendingNegotiations(devices = []) {
  return devices.filter((d) => countUnreadForAdmin(d.messages) > 0);
}

export function getLatestMessagePreview(messages = []) {
  if (!messages.length) return "Henüz mesaj yok";
  const latest = messages[messages.length - 1];
  if (latest.type === "discount_request") {
    return latest.text || `%${latest.discountPercent} indirim talebi`;
  }
  if (latest.type === "admin_decision") {
    return latest.text || "Admin yanıtı";
  }
  return latest.text || "Mesaj";
}
