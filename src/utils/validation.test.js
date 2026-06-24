import { validateEmail, validatePhone } from "./validation";

describe("validateEmail", () => {
  it("boş e-postayı geçerli sayar", () => {
    expect(validateEmail("").valid).toBe(true);
  });

  it("geçerli e-postayı kabul eder", () => {
    expect(validateEmail("test@ornek.com").valid).toBe(true);
  });

  it("geçersiz e-postayı reddeder", () => {
    expect(validateEmail("gecersiz").valid).toBe(false);
  });
});

describe("validatePhone", () => {
  it("boş telefonu reddeder", () => {
    expect(validatePhone("").valid).toBe(false);
  });

  it("10+ haneli telefonu kabul eder", () => {
    expect(validatePhone("0532 123 45 67").valid).toBe(true);
  });

  it("kısa numarayı reddeder", () => {
    expect(validatePhone("12345").valid).toBe(false);
  });
});
