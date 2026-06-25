import {
  getStatusGroup,
  countByGroup,
  filterByGroup,
  getReferansNo,
  normalizeReferansKey,
  parseCustomerId,
  findDeviceByCustomerInput,
  deriveOverallStatusFromArizalar,
} from "./statusHelpers";

const sampleDevices = [
  { id: 1, referansNo: "CIH-20260609-0001", durum: "Beklemede" },
  { id: 2, referansNo: "CIH-20260609-0002", durum: "Tamirde" },
  { id: 3, referansNo: "CIH-20260608-0001", durum: "Teslim Edildi" },
];

describe("getStatusGroup", () => {
  it("durumları doğru gruplara ayırır", () => {
    expect(getStatusGroup("Beklemede")).toBe("pending");
    expect(getStatusGroup("İnceleniyor")).toBe("pending");
    expect(getStatusGroup("Tamirde")).toBe("approved");
    expect(getStatusGroup("Başlandı")).toBe("approved");
    expect(getStatusGroup("Teslim Edildi")).toBe("delivered");
    expect(getStatusGroup("Reddedildi")).toBe("pending");
  });
});

describe("countByGroup / filterByGroup", () => {
  it("grup sayılarını hesaplar", () => {
    expect(countByGroup(sampleDevices, "pending")).toBe(1);
    expect(countByGroup(sampleDevices, "approved")).toBe(1);
    expect(countByGroup(sampleDevices, "delivered")).toBe(1);
  });

  it("gruba göre filtreler", () => {
    expect(filterByGroup(sampleDevices, "approved")).toHaveLength(1);
    expect(filterByGroup(sampleDevices, "all")).toHaveLength(3);
  });
});

describe("getReferansNo", () => {
  it("referansNo varsa onu döner", () => {
    expect(getReferansNo({ id: 5, referansNo: "CIH-20260609-0005" })).toBe(
      "CIH-20260609-0005"
    );
  });

  it("referansNo yoksa geriye dönük format üretir", () => {
    expect(getReferansNo({ id: 42 })).toBe("TRK-2026-42");
  });
});

describe("normalizeReferansKey", () => {
  it("boşluk ve büyük/küçük harf farkını yok sayar", () => {
    expect(normalizeReferansKey(" cih-20260609-0001 ")).toBe("CIH-20260609-0001");
  });
});

describe("parseCustomerId", () => {
  it("CIH formatını kabul eder", () => {
    const result = parseCustomerId("CIH-20260609-3");
    expect(result.valid).toBe(true);
    expect(result.referansNo).toBe("CIH-20260609-0003");
  });

  it("CHZ formatlarını kabul eder (tireli, tiresiz, boşluklu)", () => {
    const res1 = parseCustomerId("CHZ-10001");
    expect(res1.valid).toBe(true);
    expect(res1.referansNo).toBe("CHZ-10001");

    const res2 = parseCustomerId("chz10002");
    expect(res2.valid).toBe(true);
    expect(res2.referansNo).toBe("CHZ-10002");

    const res3 = parseCustomerId("CHZ 10003");
    expect(res3.valid).toBe(true);
    expect(res3.referansNo).toBe("CHZ-10003");
  });

  it("boş girişi reddeder", () => {
    expect(parseCustomerId("").valid).toBe(false);
  });
});

describe("findDeviceByCustomerInput", () => {
  const devices = [
    { id: 1, referansNo: "CHZ-10001", eskiReferansNo: "CIH-20260609-0001", durum: "Beklemede" },
    { id: 2, referansNo: "CHZ-10002", eskiReferansNo: "TRK-2026-2", durum: "Tamirde" },
    { id: 3, referansNo: "CHZ-10003", durum: "Hazır" },
  ];

  it("referans numarası ile cihaz bulur", () => {
    const result = findDeviceByCustomerInput(devices, "CHZ-10001");
    expect(result.found).toBe(true);
    expect(result.deviceId).toBe(1);
  });

  it("tiresiz referans numarası ile cihaz bulur", () => {
    const result = findDeviceByCustomerInput(devices, "chz10002");
    expect(result.found).toBe(true);
    expect(result.deviceId).toBe(2);
  });

  it("eski referans numarası ile cihaz bulur (eskiReferansNo)", () => {
    const result = findDeviceByCustomerInput(devices, "CIH-20260609-0001");
    expect(result.found).toBe(true);
    expect(result.deviceId).toBe(1);
  });

  it("son hane (suffix) ile cihaz bulur (CHZ ve CIH son ekleri)", () => {
    const res1 = findDeviceByCustomerInput(devices, "10003");
    expect(res1.found).toBe(true);
    expect(res1.deviceId).toBe(3);

    // Eski CIH son eki (0001 -> CIH-20260609-0001 / CHZ-10001 eskiRef)
    const res2 = findDeviceByCustomerInput(devices, "0001");
    expect(res2.found).toBe(true);
    expect(res2.deviceId).toBe(1);
  });

  it("olmayan kayıtta bulunamadı döner", () => {
    const result = findDeviceByCustomerInput(devices, "CHZ-99999");
    expect(result.found).toBe(false);
  });
});

describe("deriveOverallStatusFromArizalar", () => {
  it("tüm arızalar reddedildiyse Reddedildi döner", () => {
    const arizalar = [
      { id: 1, durum: "Reddedildi" },
      { id: 2, durum: "Reddedildi" },
    ];
    expect(deriveOverallStatusFromArizalar(arizalar)).toBe("Reddedildi");
  });

  it("tamamlanan arıza varsa Hazır döner", () => {
    const arizalar = [
      { id: 1, durum: "Tamamlandı" },
      { id: 2, durum: "Reddedildi" },
    ];
    expect(deriveOverallStatusFromArizalar(arizalar)).toBe("Hazır");
  });

  it("devam eden arıza varsa Tamirde döner", () => {
    const arizalar = [
      { id: 1, durum: "Başlandı" },
      { id: 2, durum: "Beklemede" },
    ];
    expect(deriveOverallStatusFromArizalar(arizalar)).toBe("Tamirde");
  });
});
