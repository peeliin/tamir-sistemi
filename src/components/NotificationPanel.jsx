import { useState, useRef, useEffect } from "react";
import NegotiationModal from "./NegotiationModal";
import {
  countAllPendingForAdmin,
  getDevicesWithPendingNegotiations,
  getLatestMessagePreview,
  countUnreadForAdmin,
} from "../utils/negotiationHelpers";
import { getReferansNo } from "../utils/statusHelpers";
import "./NotificationPanel.css";

function NotificationPanel({ devices, setDevices }) {
  const [open, setOpen] = useState(false);
  const [chatDeviceId, setChatDeviceId] = useState(null);
  const panelRef = useRef(null);

  const pendingCount = countAllPendingForAdmin(devices);
  const threads = getDevicesWithPendingNegotiations(devices);

  const chatDevice = chatDeviceId
    ? devices.find((d) => d.id === chatDeviceId)
    : null;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const openThread = (deviceId) => {
    setChatDeviceId(deviceId);
    setOpen(false);
  };

  const updateChatDevice = (updated) => {
    setDevices(devices.map((d) => (d.id === updated.id ? updated : d)));
  };

  return (
    <>
      <div className="notification-panel" ref={panelRef}>
        <button
          type="button"
          className="notification-panel__bell"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Bildirimler"
          aria-expanded={open}
        >
          <svg
            className="notification-panel__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {pendingCount > 0 && (
            <span className="notification-panel__badge">
              {pendingCount > 99 ? "99+" : pendingCount}
            </span>
          )}
        </button>

        {open && (
          <div className="notification-panel__dropdown">
            <div className="notification-panel__head">
              <h4>Pazarlık Bildirimleri</h4>
              {pendingCount > 0 && (
                <span className="notification-panel__count">{pendingCount} bekleyen</span>
              )}
            </div>

            {threads.length === 0 ? (
              <p className="notification-panel__empty">Bekleyen müşteri teklifi yok.</p>
            ) : (
              <ul className="notification-panel__list">
                {threads.map((device) => {
                  const unread = countUnreadForAdmin(device.messages);
                  return (
                    <li key={device.id}>
                      <button
                        type="button"
                        className="notification-panel__thread"
                        onClick={() => openThread(device.id)}
                      >
                        <div className="notification-panel__thread-top">
                          <strong>{device.adSoyad || "Müşteri"}</strong>
                          {unread > 0 && (
                            <span className="notification-panel__thread-badge">{unread}</span>
                          )}
                        </div>
                        <span className="notification-panel__ref">{getReferansNo(device)}</span>
                        <span className="notification-panel__preview">
                          {getLatestMessagePreview(device.messages)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {chatDevice && (
        <NegotiationModal
          device={chatDevice}
          isAdmin
          onUpdate={updateChatDevice}
          onClose={() => setChatDeviceId(null)}
        />
      )}
    </>
  );
}

export default NotificationPanel;
