import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import { ADMIN_USER, ADMIN_PASS } from "../config/auth";
import { findDeviceByCustomerInput } from "../utils/statusHelpers";
import { loadDevices } from "../utils/deviceStorage";
import "./Login.css";

function getExampleReferans() {
  const n = new Date();
  const y = n.getFullYear();
  const m = String(n.getMonth() + 1).padStart(2, "0");
  const d = String(n.getDate()).padStart(2, "0");
  return `CIH-${y}${m}${d}-0001`;
}

function Login({ devices = [], setCustomerId, onAdminLogin, forceAdmin = false }) {
  const navigate = useNavigate();
  const [view, setView] = useState(forceAdmin ? "admin" : "home");
  const [inputId, setInputId] = useState("");
  const [customerPass, setCustomerPass] = useState("");
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCustomerLogin = () => {
    setError("");
    setSuccess("");

    const stored = loadDevices();
    const deviceList = stored.length > 0 ? stored : devices;
    const result = findDeviceByCustomerInput(deviceList, inputId);
    if (!result.parsed?.valid) {
      if (result.parsed?.error === "empty") {
        setError("Lütfen müşteri ID giriniz.");
      } else {
        setError(
          `Geçersiz format. Admin listesindeki Referans No ile aynı girin (örn. ${getExampleReferans()}).`
        );
      }
      return;
    }

    if (!result.found) {
      setError(
        "Bu referans numarasına ait kayıt bulunamadı. Admin listesindeki Referans No'yu kontrol edin."
      );
      return;
    }

    const device = deviceList.find((d) => String(d.id) === String(result.deviceId));

    if (device?.sifre) {
      if (!customerPass.trim()) {
        setError("Lütfen kayıt şifrenizi giriniz.");
        return;
      }
      if (device.sifre !== customerPass) {
        setError("Şifre hatalı.");
        return;
      }
    }

    setCustomerId(result.deviceId);
    navigate("/takip");
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!adminUser.trim() || !adminPass.trim()) {
      setError("Kullanıcı adı ve şifre zorunludur.");
      return;
    }

    if (adminUser.trim() === ADMIN_USER && adminPass === ADMIN_PASS) {
      onAdminLogin();
      setSuccess("Giriş başarılı. Yönlendiriliyorsunuz...");
    } else {
      setError("Kullanıcı adı veya şifre hatalı.");
    }
  };

  const adminTopButton = !forceAdmin && view !== "admin" && (
    <button
      type="button"
      className="admin-entry-btn"
      onClick={() => navigate("/admin/giris")}
      aria-label="Admin girişi"
    >
      Admin
    </button>
  );

  if (view === "home" && !forceAdmin) {
    return (
      <div className="login-container login-container--home">
        {adminTopButton}

        <div className="login-box">
          <div className="login-brand">
            <h1>Elektronik Tamir Sistemi</h1>
            <p>Cihaz durumunuzu takip edin</p>
          </div>

          <Alert message={error} type="error" onClose={() => setError("")} />

          <div className="login-form">
            <label>
              Referans / Takip No
              <input
                placeholder="CIH-YYYYMMDD-0001 (listeden kopyalayın)"
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCustomerLogin()}
              />
            </label>

            <label>
              Kayıt Şifresi
              <input
                type="password"
                placeholder="Kayıt sırasında belirlenen şifre"
                value={customerPass}
                onChange={(e) => setCustomerPass(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCustomerLogin()}
                autoComplete="current-password"
              />
            </label>

            <button type="button" className="login-submit" onClick={handleCustomerLogin}>
              Giriş Yap
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "admin" || forceAdmin) {
    return (
      <div className="login-container login-container--admin">
        {!forceAdmin && (
          <button
            type="button"
            className="admin-entry-btn admin-entry-btn--back"
            onClick={() => setView("home")}
          >
            ← Müşteri
          </button>
        )}

        <div className="login-box">
          {forceAdmin && (
            <button type="button" className="login-back" onClick={() => navigate("/")}>
              ← Ana menü
            </button>
          )}

          <h2>Admin Girişi</h2>
          <p className="login-subtitle">Yönetici paneline giriş yapın</p>

          <Alert message={error} type="error" onClose={() => setError("")} />
          <Alert message={success} type="success" onClose={() => setSuccess("")} />

          <form className="login-form" onSubmit={handleAdminSubmit}>
            <label>
              Kullanıcı Adı
              <input
                type="text"
                placeholder="Kullanıcı adınız"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                autoComplete="username"
              />
            </label>

            <label>
              Şifre
              <input
                type="password"
                placeholder="Şifreniz"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                autoComplete="current-password"
              />
            </label>

            <button type="submit" className="login-submit">
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
}

export default Login;
