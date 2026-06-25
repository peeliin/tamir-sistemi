import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import { ADMIN_USER, ADMIN_PASS } from "../config/auth";
import { findDeviceByCustomerInput } from "../utils/statusHelpers";
import { loadDevices } from "../utils/deviceStorage";
import "./Login.css";

function getExampleReferans() {
  return "CHZ-10001";
}

function Login({ devices = [], setCustomerId, onAdminLogin, forceAdmin = false }) {
  const navigate = useNavigate();
  const [inputId, setInputId] = useState("");
  const [customerPass, setCustomerPass] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const identifier = inputId.trim();
    const pass = customerPass.trim();

    if (!identifier || !pass) {
      setError("Lütfen tüm alanları doldurunuz.");
      return;
    }

    // Admin doğrulaması
    if (identifier === ADMIN_USER && pass === ADMIN_PASS) {
      onAdminLogin();
      setSuccess("Yönetici girişi başarılı. Yönlendiriliyorsunuz...");
      return;
    }

    // Müşteri doğrulaması
    const stored = loadDevices();
    const deviceList = stored.length > 0 ? stored : devices;
    const result = findDeviceByCustomerInput(deviceList, identifier);

    if (!result.parsed?.valid) {
      setError(
        `Geçersiz format. Referans No ile aynı girin (örn. ${getExampleReferans()}).`
      );
      return;
    }

    if (!result.found) {
      setError("Bu referans numarasına ait kayıt bulunamadı.");
      return;
    }

    const device = deviceList.find((d) => String(d.id) === String(result.deviceId));

    if (device?.sifre) {
      if (device.sifre !== pass) {
        setError("Şifre hatalı.");
        return;
      }
    }

    setCustomerId(result.deviceId);
    navigate("/takip");
  };

  return (
    <div className="login-container login-container--home">
      <div className="login-box">
        <div className="login-brand">
          <h1>Elektronik Tamir Sistemi</h1>
          <p>Cihaz takibi ve yönetici girişi için bilgilerinizi yazın</p>
        </div>

        <Alert message={error} type="error" onClose={() => setError("")} />
        <Alert message={success} type="success" onClose={() => setSuccess("")} />

        <form className="login-form" onSubmit={handleLogin}>
          <label>
            Referans No / Kullanıcı Adı
            <input
              placeholder="Örn: admin veya CHZ-10001"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              autoComplete="username"
            />
          </label>

          <label>
            Şifre / Müşteri Şifresi
            <input
              type="password"
              placeholder="Şifre"
              value={customerPass}
              onChange={(e) => setCustomerPass(e.target.value)}
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

export default Login;
