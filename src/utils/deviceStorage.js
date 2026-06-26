const DEVICES_KEY = "devices";

/** localStorage'dan güncel cihaz listesini okur (tek kaynak). */
export function loadDevices() {
  try {
    const saved = localStorage.getItem(DEVICES_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    let modified = false;
    const migrated = [];

    for (let i = 0; i < parsed.length; i++) {
      const d = parsed[i];
      let currentDevice = { ...d };

      // Cihaz kimliği kontrolü, bütünlüğü ve benzersizliği
      const isIdAlreadyAssigned = (idVal) => migrated.some((x) => String(x.id) === String(idVal));
      if (!currentDevice.id || isIdAlreadyAssigned(currentDevice.id)) {
        modified = true;
        let newId = Date.now() + i;
        while (isIdAlreadyAssigned(newId)) {
          newId += 1;
        }
        currentDevice.id = newId;
      }

      // Müşteri şifresi bütünlük kontrolü (Giriş yapabilmesi için)
      if (!currentDevice.sifre || !String(currentDevice.sifre).trim()) {
        modified = true;
        currentDevice.sifre = "1234";
      }

      // 1. Arızalar listesi göçü (geriye dönük uyumluluk)
      if (!currentDevice.arizalar) {
        modified = true;
        const isNotified = currentDevice.durum !== "Beklemede" && currentDevice.durum !== "Cihaz Alındı";
        let isApproved = null;
        if (["Onaylandı", "Tamirde", "Hazır", "Teslim Edildi"].includes(currentDevice.durum)) {
          isApproved = true;
        } else if (currentDevice.durum === "Reddedildi") {
          isApproved = false;
        }
        currentDevice.arizalar = [
          {
            id: 1,
            arizaNot: currentDevice.arizaNot || "Genel Arıza",
            islem: currentDevice.islem || "",
            fiyat: Number(currentDevice.fiyat) || 0,
            durum: currentDevice.durum || "Beklemede",
            bildirimYapildi: isNotified,
            onayli: isApproved,
          },
        ];
      }

      // 2. Referans numarası göçü ve benzersizlik kontrolü (CHZ- formatına dönüştürme)
      const ref = currentDevice.referansNo || "";
      const isRefAlreadyAssigned = (no) => migrated.some((x) => (x.referansNo || "").toUpperCase() === no.toUpperCase());

      if (!ref.toUpperCase().startsWith("CHZ-") || isRefAlreadyAssigned(ref)) {
        modified = true;
        // Eski referans numarasını geriye dönük uyumluluk ve arama için yedekle
        if (ref && !currentDevice.eskiReferansNo) {
          currentDevice.eskiReferansNo = ref;
        }

        // Benzersiz CHZ- referans numarası üret
        const prefix = "CHZ-";
        let seq = 10001;
        const isTaken = (no) =>
          migrated.some((x) => (x.referansNo || "").toUpperCase() === no.toUpperCase()) ||
          parsed.some((x) => (x.referansNo || "").toUpperCase() === no.toUpperCase());

        let referansNo = `${prefix}${seq}`;
        while (isTaken(referansNo)) {
          seq += 1;
          referansNo = `${prefix}${seq}`;
        }
        currentDevice.referansNo = referansNo;
      }

      migrated.push(currentDevice);
    }

    if (modified) {
      localStorage.setItem(DEVICES_KEY, JSON.stringify(migrated));
    }
    return migrated;
  } catch (e) {
    console.error("loadDevices error:", e);
    return [];
  }
}

export function saveDevices(devices) {
  localStorage.setItem(DEVICES_KEY, JSON.stringify(devices));
}
