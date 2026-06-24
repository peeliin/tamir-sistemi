import {
  getStatusGroup,
  countByGroup,
  filterByGroup,
  getReferansNo,
  normalizeReferansKey,
  parseCustomerId,
  findDeviceByCustomerInput,
} from "./statusHelpers";

const sampleDevices = [
  { id: 1, referansNo: "CIH-20260609-0001", durum: "Beklemede" },
  { id: 2, referansNo: "CIH-20260609-0002", durum: "Tamirde" },
  { id: 3, referansNo: "CIH-20260608-0001", durum: "Teslim Edildi" },
];

describe("getStatusGroup", () => {
  it("durumları doğru gruplara ayırır", () => {
    expect(getStatusGroup("Beklemede")).toBe("pending");
    expect(getStatusGroup("Tamirde")).toBe("approved");
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

  it("boş girişi reddeder", () => {
    expect(parseCustomerId("").valid).toBe(false);
  });
});

describe("findDeviceByCustomerInput", () => {
  it("referans numarası ile cihaz bulur", () => {
    const result = findDeviceByCustomerInput(sampleDevices, "CIH-20260609-0002");
    expect(result.found).toBe(true);
    expect(result.deviceId).toBe(2);
  });

  it("olmayan kayıtta bulunamadı döner", () => {
    const result = findDeviceByCustomerInput(sampleDevices, "CIH-20990101-9999");
    expect(result.found).toBe(false);
  });
});
