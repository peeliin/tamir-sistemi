/**
 * Benzersiz referans numarası üretir.
 * Format: CHZ-10001, CHZ-10002, ...
 */
export function generateReferansNo(devices = []) {
  const prefix = "CHZ-";
  const startSeq = 10001;

  const isTaken = (no) =>
    devices.some((d) => (d.referansNo || "").toUpperCase() === no.toUpperCase());

  let seq = startSeq;
  let referansNo = `${prefix}${seq}`;
  while (isTaken(referansNo)) {
    seq += 1;
    referansNo = `${prefix}${seq}`;
  }

  return referansNo;
}

/** @deprecated Eski çağrılar için — generateReferansNo kullanın */
export function generateDeviceId(devices) {
  return generateReferansNo(devices);
}
