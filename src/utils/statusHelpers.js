/** Geriye dönük uyumlu durum grupları */

const PENDING_STATUSES = [

  "Beklemede",

  "Cihaz Alındı",

  "Onay Bekliyor",

  "İnceleniyor",

  "pending",

];



const APPROVED_STATUSES = [

  "Onaylandı",

  "Tamirde",

  "Hazır",

  "approved",

];



const DELIVERED_STATUSES = ["Teslim Edildi", "delivered"];



export const STATUS_LABELS = {

  pending: "Bekleyen",

  approved: "Onaylanan",

  delivered: "Teslim Edilen",

};



export function getStatusGroup(durum) {
  if (!durum) return "pending";
  if (durum === "İnceleniyor") return "inceleniyor";
  if (durum === "Başlandı") return "baslandi";
  if (durum === "Tamamlandı") return "delivered";
  if (DELIVERED_STATUSES.includes(durum)) return "delivered";
  if (APPROVED_STATUSES.includes(durum)) return "approved";
  if (PENDING_STATUSES.includes(durum)) return "pending";
  if (durum === "Reddedildi") return "pending";
  return "pending";
}



export function countByGroup(devices, group) {

  return devices.filter((d) => getStatusGroup(d.durum) === group).length;

}



export function filterByGroup(devices, group) {

  if (!group || group === "all") return devices;

  return devices.filter((d) => getStatusGroup(d.durum) === group);

}



export function getReferansNo(device) {

  if (device?.referansNo) return String(device.referansNo);

  return `TRK-2026-${device.id}`;

}



/** Geriye dönük alias */

export function getTrackingNo(device) {

  return getReferansNo(device);

}



/** Karşılaştırma için referans anahtarı (tire/boşluk/büyük-küçük harf toleranslı) */

export function normalizeReferansKey(value) {

  return String(value || "")

    .trim()

    .toUpperCase()

    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "")

    .replace(/[\u2013\u2014\u2212]/g, "-")

    .replace(/\s+/g, "")

    .replace(/_/g, "");

}



export function normalizeCustomerInput(input) {

  return String(input || "")

    .trim()

    .replace(/[\u200B-\u200D\uFEFF]/g, "")

    .replace(/\u00A0/g, " ")

    .replace(/[\u2013\u2014\u2212]/g, "-")

    .replace(/\s+/g, "");

}



/** CIH sonekini 4 haneye normalize eder: 3→0003, 00003→0003 */

function normalizeCihSuffix(seq) {

  const digits = String(seq).replace(/\D/g, "");

  if (!digits) return "0000";

  if (digits.length <= 4) return digits.padStart(4, "0");

  return digits.slice(-4);

}



function buildCihReferans(datePart, seqPart) {

  return `CIH-${datePart}-${normalizeCihSuffix(seqPart)}`.toUpperCase();

}



export function parseCustomerId(input) {
  const trimmed = normalizeCustomerInput(input);
  if (!trimmed) return { valid: false, error: "empty" };

  // CHZ-10001, CHZ10001, CHZ 10001 gibi esnek girişleri tanı
  const chzMatch = trimmed.match(/^CHZ-?(\d+)$/i);
  if (chzMatch) {
    return { valid: true, referansNo: `CHZ-${chzMatch[1]}` };
  }

  const fullMatch = trimmed.match(/^TRK-2026-(\d+)$/i);

  if (fullMatch) {

    return { valid: true, id: Number(fullMatch[1]), referansNo: trimmed.toUpperCase() };

  }



  if (/^TRK-\d{4}-.+$/i.test(trimmed)) {

    return { valid: true, referansNo: trimmed.toUpperCase() };

  }



  const cihMatch = trimmed.match(/^CIH-(\d{8})-(\d+)$/i);

  if (cihMatch) {

    return { valid: true, referansNo: buildCihReferans(cihMatch[1], cihMatch[2]) };

  }



  const embeddedCih = trimmed.match(/CIH-(\d{8})-(\d+)/i);

  if (embeddedCih) {

    return {

      valid: true,

      referansNo: buildCihReferans(embeddedCih[1], embeddedCih[2]),

    };

  }



  const compact = trimmed.replace(/[^A-Za-z0-9]/g, "");

  const compactCih = compact.match(/^CIH(\d{8})(\d+)$/i);

  if (compactCih) {

    return { valid: true, referansNo: buildCihReferans(compactCih[1], compactCih[2]) };

  }



  if (/^\d+$/.test(trimmed)) {

    return { valid: true, id: Number(trimmed), rawDigits: trimmed };

  }



  return { valid: false, error: "format" };

}



function findByReferansKey(list, key) {

  if (!key) return null;

  const target = normalizeReferansKey(key);
  const targetAlpha = target.replace(/[^A-Z0-9]/g, "");

  return (

    list.find((d) => {

      // Hem güncel referansNo, hem eskiReferansNo hem de geriye dönük id referansını kontrol et
      const refs = [d.referansNo, d.eskiReferansNo, getReferansNo(d)].filter(Boolean);

      return refs.some((ref) => {
        const normRef = normalizeReferansKey(ref);
        return normRef === target || normRef.replace(/[^A-Z0-9]/g, "") === targetAlpha;
      });

    }) || null

  );

}



function findBySuffix(list, digits) {

  if (!digits) return null;

  const matches = list.filter((d) => {

    const ref = getReferansNo(d);
    const normRef = normalizeReferansKey(ref);
    const normEski = d.eskiReferansNo ? normalizeReferansKey(d.eskiReferansNo) : "";

    // 1. Doğrudan son ek eşleşmesi (örn. CHZ-10001 için 10001 girişi)
    if (ref.endsWith(digits) || normRef.endsWith(digits) || (normEski && normEski.endsWith(digits))) {
      return true;
    }

    // 2. Geriye dönük 4 haneli CIH son eki eşleşmesi
    const suffix = normalizeCihSuffix(digits);

    return (
      ref.endsWith(`-${suffix}`) || 
      ref.endsWith(suffix) || 
      (normEski && (normEski.endsWith(`-${suffix}`) || normEski.endsWith(suffix)))
    );

  });

  return matches.length === 1 ? matches[0] : null;

}



export function findDeviceByCustomerInput(devices, input) {

  const list = Array.isArray(devices) ? devices : [];

  const trimmed = normalizeCustomerInput(input);



  if (!trimmed) {

    return { found: false, parsed: { valid: false, error: "empty" } };

  }



  const direct = findByReferansKey(list, trimmed);

  if (direct) {

    return {

      found: true,

      deviceId: direct.id,

      parsed: { valid: true, referansNo: getReferansNo(direct) },

    };

  }



  const parsed = parseCustomerId(input);



  if (parsed.referansNo) {

    const byRef = findByReferansKey(list, parsed.referansNo);

    if (byRef) return { found: true, deviceId: byRef.id, parsed };

  }



  if (parsed.id != null) {

    const byId = list.find((d) => String(d.id) === String(parsed.id));

    if (byId) return { found: true, deviceId: byId.id, parsed };

  }



  if (parsed.rawDigits) {

    const bySuffix = findBySuffix(list, parsed.rawDigits);

    if (bySuffix) return { found: true, deviceId: bySuffix.id, parsed };

  }



  if (!parsed.valid) {

    const bySuffix = findBySuffix(list, trimmed);

    if (bySuffix) {

      return {

        found: true,

        deviceId: bySuffix.id,

        parsed: { valid: true, referansNo: getReferansNo(bySuffix) },

      };

    }

  }



  return { found: false, parsed };

}


