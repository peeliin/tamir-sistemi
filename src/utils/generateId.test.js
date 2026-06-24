import { generateReferansNo } from "./generateId";

describe("generateReferansNo", () => {
  it("CIH-YYYYMMDD-0001 formatında üretir", () => {
    const ref = generateReferansNo([]);
    expect(ref).toMatch(/^CIH-\d{8}-0001$/);
  });

  it("aynı gün içinde sırayı artırır", () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const prefix = `CIH-${y}${m}${d}-`;

    const devices = [{ referansNo: `${prefix}0001` }, { referansNo: `${prefix}0002` }];
    expect(generateReferansNo(devices)).toBe(`${prefix}0003`);
  });

  it("çakışan numarayı atlar", () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const prefix = `CIH-${y}${m}${d}-`;

    const devices = [{ referansNo: `${prefix}0001` }, { referansNo: `${prefix}0003` }];
    expect(generateReferansNo(devices)).toBe(`${prefix}0002`);
  });
});
