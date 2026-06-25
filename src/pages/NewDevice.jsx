import { useState } from "react";
import Alert from "../components/Alert";
import { generateReferansNo } from "../utils/generateId";
import { validateEmail, validatePhone } from "../utils/validation";
import "./NewDevice.css";

const CIHAZ_TURLERI = ["Telefon", "PC", "Tablet"];

const MARKALAR = {
  Telefon: ["Apple", "Samsung", "Xiaomi", "Huawei", "Oppo", "Diğer"],
  PC: ["Apple", "Lenovo", "Asus", "HP", "Dell", "Diğer"],
  Tablet: ["Apple", "Samsung", "Lenovo", "Huawei", "Diğer"],
};

const initialForm = {
  adSoyad: "",
  telefon: "",
  email: "",
  sifre: "",
  cihazTuru: "",
  marka: "",
  model: "",
  arizaNot: "",
};

function NewDevice({ devices, setDevices, onSuccess }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const update = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "cihazTuru") {
        next.marka = "";
        next.model = "";
      }
      return next;
    });
  };

  const markaOptions = form.cihazTuru ? MARKALAR[form.cihazTuru] || [] : [];

  const handleAdd = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.adSoyad.trim()) {
      setError("Ad Soyad alanı zorunludur.");
      return;
    }

    const phoneCheck = validatePhone(form.telefon);
    if (!phoneCheck.valid) {
      setError(phoneCheck.message);
      return;
    }

    const emailCheck = validateEmail(form.email);
    if (!emailCheck.valid) {
      setError(emailCheck.message);
      return;
    }

    if (!form.cihazTuru) {
      setError("Lütfen cihaz türü seçiniz.");
      return;
    }

    if (!form.marka) {
      setError("Lütfen marka seçiniz.");
      return;
    }

    const markaValue =
      form.marka === "Diğer" ? form.model.trim().split(" ")[0] || "Diğer" : form.marka;

    if (!form.model.trim()) {
      setError("Model alanı zorunludur.");
      return;
    }

    if (!form.arizaNot.trim()) {
      setError("Arıza / not açıklaması zorunludur.");
      return;
    }

    if (!form.sifre.trim()) {
      setError("Müşteri şifresi zorunludur.");
      return;
    }

    if (form.sifre.trim().length < 4) {
      setError("Müşteri şifresi en az 4 karakter olmalıdır.");
      return;
    }

    const id = Date.now();
    const referansNo = generateReferansNo(devices);

    const newDevice = {
      id,
      referansNo,
      adSoyad: form.adSoyad.trim(),
      telefon: form.telefon.trim(),
      email: form.email.trim(),
      sifre: form.sifre,
      cihazTuru: form.cihazTuru,
      marka: markaValue,
      model: form.model.trim(),
      arizaNot: form.arizaNot.trim(),
      islem: "",
      fiyat: 0,
      durum: "Beklemede",
      history: [
        {
          step: "Cihaz Alındı",
          date: new Date().toLocaleString("tr-TR"),
        },
        {
          step: "Beklemede",
          date: new Date().toLocaleString("tr-TR"),
        },
      ],
    };

    setDevices([...devices, newDevice]);
    setForm(initialForm);
    setSuccess(`Kayıt oluşturuldu. Referans No: ${referansNo}`);
    if (onSuccess) onSuccess(referansNo);
  };

  return (
    <div className="new-device">
      <h3>Yeni Cihaz Kaydı</h3>
      <p className="new-device__info">
        Referans numarası kayıt sırasında sistem tarafından otomatik oluşturulur.
      </p>

      <Alert message={error} type="error" onClose={() => setError("")} />
      <Alert message={success} type="success" onClose={() => setSuccess("")} />

      <form onSubmit={handleAdd}>
        <fieldset className="form-section">
          <legend>1. Kullanıcı Bilgileri</legend>

          <label>
            Ad Soyad *
            <input
              type="text"
              value={form.adSoyad}
              onChange={(e) => update("adSoyad", e.target.value)}
              placeholder="Ad Soyad"
            />
          </label>

          <label>
            Telefon *
            <input
              type="tel"
              value={form.telefon}
              onChange={(e) => update("telefon", e.target.value)}
              placeholder="05XX XXX XX XX"
            />
          </label>

          <label>
            E-posta
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="ornek@email.com"
            />
          </label>

          <label>
            Müşteri Şifresi *
            <input
              type="password"
              value={form.sifre}
              onChange={(e) => update("sifre", e.target.value)}
              placeholder="Müşteri sorgulama şifresi"
              autoComplete="new-password"
            />
            <span className="field-hint">Müşteri, cihaz durumu sorgularken bu şifreyi kullanır</span>
          </label>
        </fieldset>

        <fieldset className="form-section">
          <legend>2. Cihaz Bilgileri</legend>

          <label>
            Cihaz Türü *
            <select
              value={form.cihazTuru}
              onChange={(e) => update("cihazTuru", e.target.value)}
            >
              <option value="">Seçiniz</option>
              {CIHAZ_TURLERI.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label>
            Marka *
            <select
              value={form.marka}
              onChange={(e) => update("marka", e.target.value)}
              disabled={!form.cihazTuru}
            >
              <option value="">Marka seçin</option>
              {markaOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <label>
            Model *
            <input
              type="text"
              placeholder="Örn: iPhone 11, ThinkPad X1"
              value={form.model}
              onChange={(e) => update("model", e.target.value)}
              disabled={!form.cihazTuru}
            />
          </label>
        </fieldset>

        <fieldset className="form-section">
          <legend>3. Servis / Arıza Bilgileri</legend>

          <label>
            Arıza / Not Açıklaması *
            <textarea
              rows={4}
              value={form.arizaNot}
              onChange={(e) => update("arizaNot", e.target.value)}
              placeholder="Cihazdaki arıza veya ek notlar"
            />
          </label>
        </fieldset>

        <button type="submit" className="new-device__submit">
          Kaydı Oluştur
        </button>
      </form>
    </div>
  );
}

export default NewDevice;
