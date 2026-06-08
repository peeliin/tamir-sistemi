/**
 * Benzersiz referans numarası üretir.
 * Format: CIH-YYYYMMDD-0001
 */
export function generateReferansNo(devices = []) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const datePart = `${y}${m}${d}`;
  const prefix = `CIH-${datePart}-`;

  const existingSeqs = devices
    .map((dev) => dev.referansNo)
    .filter((ref) => ref && ref.toUpperCase().startsWith(prefix.toUpperCase()))
    .map((ref) => {
      const match = ref.match(/-(\d{4})$/i);
      return match ? parseInt(match[1], 10) : 0;
    });

  let seq = existingSeqs.length > 0 ? Math.max(...existingSeqs) + 1 : 1;

  const isTaken = (no) =>
    devices.some((d) => (d.referansNo || "").toUpperCase() === no.toUpperCase());

  let referansNo = `${prefix}${String(seq).padStart(4, "0")}`;
  while (isTaken(referansNo)) {
    seq += 1;
    referansNo = `${prefix}${String(seq).padStart(4, "0")}`;
  }

  return referansNo;
}

/** @deprecated Eski çağrılar için — generateReferansNo kullanın */
export function generateDeviceId(devices) {
  return generateReferansNo(devices);
}
