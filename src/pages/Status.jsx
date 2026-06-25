import { useState } from "react";
import NewDevice from "./NewDevice";
import Alert from "../components/Alert";
import ConfirmModal from "../components/ConfirmModal";
import DashboardCard from "../components/DashboardCard";
import ResponsiveDeviceList from "../components/ResponsiveDeviceList";
import NegotiationModal from "../components/NegotiationModal";
import DeviceDetailModal from "../components/DeviceDetailModal";
import {
  countByGroup,
  filterByGroup,
  STATUS_LABELS,
} from "../utils/statusHelpers";
import "./Status.css";

function Status({ devices, setDevices }) {
  const [mode, setMode] = useState("list");
  const [statusFilter, setStatusFilter] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [confirm, setConfirm] = useState(null);
  const [chatDeviceId, setChatDeviceId] = useState(null);
  const [detailDeviceId, setDetailDeviceId] = useState(null);

  const pendingCount = countByGroup(devices, "pending");
  const approvedCount = countByGroup(devices, "approved");
  const deliveredCount = countByGroup(devices, "delivered");

  const filteredDevices = filterByGroup(devices, statusFilter);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "info" }), 3500);
  };

  const updateDevice = (id, updater) => {
    setDevices(devices.map((d) => (d.id === id ? updater(d) : d)));
  };

  const addHistory = (device, step) => ({
    ...device,
    history: [
      ...(device.history || []),
      { step, date: new Date().toLocaleString("tr-TR") },
    ],
  });

  const handleInputChange = (id, field, value) => {
    if (field === "fiyat") {
      const d = devices.find((x) => x.id === id);
      if (d) {
        const isLocked = (d.durum !== "Beklemede" && d.durum !== "Cihaz Alındı") || d.arizalar?.some(a => a.bildirimYapildi);
        if (isLocked) return;
      }
    }
    setDevices(
      devices.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const sendToCustomer = (id) => {
    setConfirm({
      message: "Kayıt müşteri onayına gönderilecek. Devam edilsin mi?",
      onConfirm: () => {
        updateDevice(id, (d) =>
          addHistory({ ...d, durum: "Onay Bekliyor" }, "Onay Bekliyor")
        );
        showToast("Kayıt onay için müşteriye gönderildi.");
        setConfirm(null);
      },
    });
  };

  const startRepair = (id) => {
    setConfirm({
      message: "Cihaz tamire alınacak. Emin misiniz?",
      onConfirm: () => {
        updateDevice(id, (d) => addHistory({ ...d, durum: "Tamirde" }, "Tamirde"));
        showToast("Tamir süreci başlatıldı.");
        setConfirm(null);
      },
    });
  };

  const finishRepair = (id) => {
    setConfirm({
      message: "Cihaz hazır durumuna alınacak. Emin misiniz?",
      onConfirm: () => {
        updateDevice(id, (d) => addHistory({ ...d, durum: "Hazır" }, "Hazır"));
        showToast("Cihaz hazır olarak işaretlendi.");
        setConfirm(null);
      },
    });
  };

  const deliverDevice = (id) => {
    setConfirm({
      message: "Cihaz teslim edildi olarak işaretlenecek. Emin misiniz?",
      confirmLabel: "Teslim Et",
      onConfirm: () => {
        updateDevice(id, (d) =>
          addHistory({ ...d, durum: "Teslim Edildi" }, "Teslim Edildi")
        );
        showToast("Cihaz teslim edildi.");
        setConfirm(null);
      },
    });
  };

  const deleteDevice = (id) => {
    setConfirm({
      message: "Bu kayıt kalıcı olarak silinecek. Emin misiniz?",
      confirmLabel: "Sil",
      onConfirm: () => {
        setDevices(devices.filter((d) => d.id !== id));
        showToast("Kayıt silindi.");
        setConfirm(null);
        if (editingId === id) setEditingId(null);
      },
    });
  };

  const handleEditToggle = (id) => {
    setEditingId((prev) => (prev === id ? null : id));
  };

  const handleFilterClick = (group) => {
    setStatusFilter((prev) => (prev === group ? null : group));
    setMode("list");
  };

  const chatDevice = chatDeviceId
    ? devices.find((d) => d.id === chatDeviceId)
    : null;

  const updateChatDevice = (updated) => {
    setDevices(devices.map((d) => (d.id === updated.id ? updated : d)));
  };

  return (
    <div className="status-container">
      <div className="status-header">
        <h2>Yönetici Paneli</h2>
        <p className="status-header__sub">Servis kayıtlarını yönetin</p>
      </div>

      <Alert
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "info" })}
      />

      <div className="dashboard-cards">
        <DashboardCard
          title={STATUS_LABELS.pending}
          count={pendingCount}
          active={statusFilter === "pending"}
          onClick={() => handleFilterClick("pending")}
        />
        <DashboardCard
          title={STATUS_LABELS.approved}
          count={approvedCount}
          active={statusFilter === "approved"}
          onClick={() => handleFilterClick("approved")}
        />
        <DashboardCard
          title={STATUS_LABELS.delivered}
          count={deliveredCount}
          active={statusFilter === "delivered"}
          onClick={() => handleFilterClick("delivered")}
        />
      </div>

      {statusFilter && (
        <p className="filter-hint">
          Filtre: <strong>{STATUS_LABELS[statusFilter]}</strong>
          <button type="button" onClick={() => setStatusFilter(null)}>
            Filtreyi kaldır
          </button>
        </p>
      )}

      <div className="top-buttons">
        <button
          type="button"
          className={mode === "add" ? "active" : ""}
          onClick={() => setMode("add")}
        >
          + Cihaz Ekle
        </button>
        <button
          type="button"
          className={mode === "list" ? "active" : ""}
          onClick={() => setMode("list")}
        >
          Cihaz Listesi
        </button>
      </div>

      {mode === "add" && (
        <NewDevice
          devices={devices}
          setDevices={setDevices}
          onSuccess={() => setMode("list")}
        />
      )}

      {mode === "list" && (
        <ResponsiveDeviceList
          devices={filteredDevices}
          onInputChange={handleInputChange}
          onSendToCustomer={sendToCustomer}
          onStartRepair={startRepair}
          onFinishRepair={finishRepair}
          onDeliver={deliverDevice}
          onDelete={deleteDevice}
          onEditToggle={handleEditToggle}
          onOpenChat={setChatDeviceId}
          onOpenDetail={setDetailDeviceId}
          editingId={editingId}
        />
      )}

      {detailDeviceId && (
        <DeviceDetailModal
          device={devices.find((d) => d.id === detailDeviceId)}
          onClose={() => setDetailDeviceId(null)}
          onUpdate={(updatedDevice) => {
            setDevices(devices.map((d) => (d.id === updatedDevice.id ? updatedDevice : d)));
          }}
        />
      )}

      {chatDevice && (
        <NegotiationModal
          device={chatDevice}
          isAdmin
          onUpdate={updateChatDevice}
          onClose={() => setChatDeviceId(null)}
        />
      )}

      <ConfirmModal
        open={!!confirm}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel || "Evet"}
        onConfirm={confirm?.onConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

export default Status;
