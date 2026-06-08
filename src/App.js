import React, { useState, useEffect } from "react";

import Navbar from "./components/Navbar";
import Status from "./pages/Status";
import CustomerStatus from "./pages/CustomerStatus";
import Login from "./pages/Login";
import { loadDevices, saveDevices } from "./utils/deviceStorage";

const ADMIN_SESSION_KEY = "adminLoggedIn";

function App() {
  const [page, setPage] = useState(() => {
    const savedAdmin = sessionStorage.getItem(ADMIN_SESSION_KEY);
    return savedAdmin === "true" ? "admin" : "login";
  });
  const [customerId, setCustomerId] = useState(null);
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
    setPage("admin");
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAdmin(false);
    setPage("login");
  };

  const goHome = () => {
    if (isAdmin) {
      setPage("admin");
    } else {
      setPage("login");
      setCustomerId(null);
    }
  };

  return (
    <>
      {page !== "login" && (
        <Navbar
          setPage={setPage}
          isAdmin={isAdmin}
          onHome={goHome}
          onLogout={handleAdminLogout}
        />
      )}

      {page === "login" && (
        <Login
          devices={devices}
          setPage={setPage}
          setCustomerId={setCustomerId}
          onAdminLogin={handleAdminLogin}
        />
      )}

      {page === "admin" && isAdmin && (
        <Status devices={devices} setDevices={setDevices} />
      )}

      {page === "admin" && !isAdmin && (
        <Login
          devices={devices}
          setPage={setPage}
          setCustomerId={setCustomerId}
          onAdminLogin={handleAdminLogin}
          forceAdmin
        />
      )}

      {page === "customer" && (
        <CustomerStatus
          devices={devices}
          setDevices={setDevices}
          customerId={customerId}
          onBack={() => {
            setCustomerId(null);
            setPage("login");
          }}
        />
      )}
    </>
  );
}

export default App;
