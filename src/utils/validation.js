export function validateEmail(email) {
  if (!email || !email.trim()) return { valid: true };
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim())
    ? { valid: true }
    : { valid: false, message: "Geçerli bir e-posta adresi giriniz." };
}

export function validatePhone(phone) {
  if (!phone || !phone.trim()) return { valid: false, message: "Telefon alanı zorunludur." };
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) {
    return { valid: false, message: "Geçerli bir telefon numarası giriniz." };
  }
  return { valid: true };
}
