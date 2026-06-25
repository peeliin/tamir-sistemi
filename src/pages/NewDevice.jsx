import { useState, useEffect } from "react";
import Alert from "../components/Alert";
import { generateReferansNo } from "../utils/generateId";
import { validateEmail, validatePhone } from "../utils/validation";
import { sendWelcomeEmail } from "../services/emailService";
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
  arizalar: [""],
};

function NewDevice({ devices, setDevices, onSuccess }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refNo, setRefNo] = useState(() => generateReferansNo(devices));

  useEffect(() => {
    setRefNo(generateReferansNo(devices));
  }, [devices]);

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

  const updateAriza = (index, value) => {
    setForm((prev) => {
      const nextArizalar = [...prev.arizalar];
      nextArizalar[index] = value;
      return { ...prev, arizalar: nextArizalar };
    });
  };

  const addArizaField = () => {
    setForm((prev) => ({
      ...prev,
      arizalar: [...prev.arizalar, ""],
    }));
  };

  const removeArizaField = (index) => {
    if (form.arizalar.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      arizalar: prev.arizalar.filter((_, idx) => idx !== index),
    }));
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

    if (!form.email.trim()) {
      setError("E-posta alanı zorunludur.");
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

    const activeArizalar = form.arizalar.filter((not) => not.trim() !== "");
    if (activeArizalar.length === 0) {
      setError("En az 1 adet arıza açıklaması zorunludur.");
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
    // use the pre-generated refNo
    const generatedRef = refNo;

    const newDevice = {
      id,
      referansNo: generatedRef,
      adSoyad: form.adSoyad.trim(),
      telefon: form.telefon.trim(),
      email: form.email.trim(),
      sifre: form.sifre,
      cihazTuru: form.cihazTuru,
      marka: markaValue,
      model: form.model.trim(),
      arizaNot: activeArizalar[0].trim(), // backward compatibility
      islem: "",
      fiyat: 0,
      durum: "Beklemede",
      arizalar: activeArizalar.map((not, idx) => ({
        id: idx + 1,
        arizaNot: not.trim(),
        islem: "",
        fiyat: 0,
        durum: "Beklemede",
        bildirimYapildi: false,
        onayli: null,
      })),
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
      messages: [],
    };

    setDevices([...devices, newDevice]);
    setForm(initialForm);

    setSuccess(`Kayıt oluşturuldu. Referans No: ${generatedRef}`);
    
    // Cihaz sisteme ilk kez kaydedildiğinde tek seferlik mail at
    sendWelcomeEmail(newDevice);

    if (onSuccess) onSuccess(generatedRef);
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
            Referans Numarası (Otomatik)
            <input
              type="text"
              value={refNo}
              disabled
              style={{ background: "#f3f4f6", color: "#6b7280", cursor: "not-allowed", fontWeight: "bold" }}
            />
          </label>

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
            E-posta *
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

          {form.arizalar.map((ariza, index) => (
            <div key={index} className="ariza-input-row" style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "12px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "4px" }}>
                  Arıza Açıklaması #{index + 1} *
                  <textarea
                    rows={2}
                    value={ariza}
                    onChange={(e) => updateAriza(index, e.target.value)}
                    placeholder="Cihazdaki arıza açıklamasını yazın"
                    style={{ width: "100%", padding: "8px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #d1d5db" }}
                  />
                </label>
              </div>
              {form.arizalar.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArizaField(index)}
                  style={{
                    marginTop: "24px",
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  Sil
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addArizaField}
            style={{
              background: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "10px 16px",
              cursor: "pointer",
              fontWeight: "600",
              marginTop: "8px"
            }}
          >
            + Başka Arıza Ekle
          </button>
        </fieldset>

        <button type="submit" className="new-device__submit">
          Kaydı Oluştur
        </button>
      </form>
    </div>
  );
}

export default NewDevice;
