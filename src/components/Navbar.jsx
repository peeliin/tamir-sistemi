import React from "react";
import { useNavigate } from "react-router-dom";
import NotificationPanel from "./NotificationPanel";
import "./Navbar.css";

function Navbar({ isAdmin, onHome, onLogout, devices, setDevices }) {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <button type="button" className="navbar__brand" onClick={onHome}>
        Tamir Paneli
      </button>

      <div className="navbar__links">
        {isAdmin && devices && setDevices && (
          <NotificationPanel devices={devices} setDevices={setDevices} />
        )}
        {isAdmin && (
          <button type="button" onClick={() => navigate("/admin")}>
            Admin Panel
          </button>
        )}
        <button type="button" className="navbar__home" onClick={onHome}>
          Ana Menü
        </button>
        {!isAdmin && (
          <button type="button" onClick={() => navigate("/")}>
            Giriş
          </button>
        )}
        {isAdmin && (
          <button type="button" className="navbar__logout" onClick={onLogout}>
            Çıkış
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
