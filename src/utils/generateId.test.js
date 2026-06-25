import { generateReferansNo } from "./generateId";

describe("generateReferansNo", () => {
  it("CHZ-10001 formatında üretir", () => {
    const ref = generateReferansNo([]);
    expect(ref).toBe("CHZ-10001");
  });

  it("sırayı artırır", () => {
    const devices = [{ referansNo: "CHZ-10001" }, { referansNo: "CHZ-10002" }];
    expect(generateReferansNo(devices)).toBe("CHZ-10003");
  });

  it("çakışan numarayı atlar", () => {
    const devices = [{ referansNo: "CHZ-10001" }, { referansNo: "CHZ-10003" }];
    expect(generateReferansNo(devices)).toBe("CHZ-10002");
  });
});
