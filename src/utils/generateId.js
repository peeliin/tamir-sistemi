/**
 * Benzersiz referans numarası üretir (Karmaşık / UUID benzeri).
 * Format: CHZ-XXXXXXXX
 */
export function generateReferansNo(devices = []) {
  const prefix = "CHZ-";

  const isTaken = (no) =>
    devices.some((d) => (d.referansNo || "").toUpperCase() === no.toUpperCase());

  let referansNo = "";
  do {
    // Generate an 8-character random string (alphanumeric)
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    referansNo = `${prefix}${randomPart}`;
  } while (isTaken(referansNo));

  return referansNo;
}

/** @deprecated Eski çağrılar için — generateReferansNo kullanın */
export function generateDeviceId(devices) {
  return generateReferansNo(devices);
}
