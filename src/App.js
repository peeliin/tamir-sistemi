import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Status from "./pages/Status";
import CustomerStatus from "./pages/CustomerStatus";
import Login from "./pages/Login";
import { ADMIN_SESSION_KEY, CUSTOMER_SESSION_KEY } from "./config/auth";
import { loadDevices, saveDevices } from "./utils/deviceStorage";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [customerId, setCustomerIdState] = useState(() => {
    const saved = sessionStorage.getItem(CUSTOMER_SESSION_KEY);
    return saved || null;
  });

  const setCustomerId = (id) => {
    if (id == null || id === "") {
      sessionStorage.removeItem(CUSTOMER_SESSION_KEY);
      setCustomerIdState(null);
    } else {
      sessionStorage.setItem(CUSTOMER_SESSION_KEY, String(id));
      setCustomerIdState(id);
    }
  };
  const [isAdmin, setIsAdmin] = useState(
    () => sessionStorage.getItem(ADMIN_SESSION_KEY) === "true"
  );
  const [devices, setDevices] = useState(() => loadDevices());

  useEffect(() => {
    saveDevices(devices);
  }, [devices]);

  useEffect(() => {
    const syncFromStorage = () => {
      setDevices(loadDevices());
    };
    window.addEventListener("storage", syncFromStorage);
    window.addEventListener("focus", syncFromStorage);
    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener("focus", syncFromStorage);
    };
  }, []);

  const handleAdminLogin = () => {
    sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    setIsAdmin(true);
    navigate("/admin");
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAdmin(false);
    sessionStorage.removeItem(CUSTOMER_SESSION_KEY);
    setCustomerIdState(null);
    navigate("/");
  };

  const goHome = () => {
    if (isAdmin) {
      navigate("/admin");
    } else {
      setCustomerId(null);
      navigate("/");
    }
  };

  const showNavbar =
    location.pathname !== "/" && location.pathname !== "/admin/giris";

  return (
    <>
      {showNavbar && (
        <Navbar
          isAdmin={isAdmin}
          onHome={goHome}
          onLogout={handleAdminLogout}
          devices={devices}
          setDevices={setDevices}
        />
      )}

      <Routes>
        <Route
          path="/"
          element={
            <Login
              devices={devices}
              setCustomerId={setCustomerId}
              onAdminLogin={handleAdminLogin}
            />
          }
        />

        <Route
          path="/admin/giris"
          element={
            <Login
              devices={devices}
              setCustomerId={setCustomerId}
              onAdminLogin={handleAdminLogin}
              forceAdmin
            />
          }
        />

        <Route
          path="/admin"
          element={
            isAdmin ? (
              <Status devices={devices} setDevices={setDevices} />
            ) : (
              <Navigate to="/admin/giris" replace />
            )
          }
        />

        <Route
          path="/takip"
          element={
            customerId ? (
              <CustomerStatus
                devices={devices}
                setDevices={setDevices}
                customerId={customerId}
                onBack={() => {
                  setCustomerId(null);
                  navigate("/");
                }}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
