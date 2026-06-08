import StatusBadge from "./StatusBadge";
import { getReferansNo } from "../utils/statusHelpers";
import "./ResponsiveDeviceList.css";

function ResponsiveDeviceList({
  devices,
  onInputChange,
  onSendToCustomer,
  onStartRepair,
  onFinishRepair,
  onDeliver,
  onDelete,
  onEditToggle,
  editingId,
}) {
  if (devices.length === 0) {
    return <p className="empty">Henüz cihaz yok</p>;
  }

  const renderActions = (d) => (
    <div className="device-actions">
      {(d.durum === "Beklemede" || d.durum === "Cihaz Alındı") && (
        <button type="button" className="action-btn action-btn--primary" onClick={() => onSendToCustomer(d.id)}>
          Onayla
        </button>
      )}
      {d.durum === "Onay Bekliyor" && (
        <span className="action-hint">Müşteri onayı bekleniyor</span>
      )}
      {d.durum === "Onaylandı" && (
        <button type="button" className="action-btn action-btn--primary" onClick={() => onStartRepair(d.id)}>
          Getir
        </button>
      )}
      {d.durum === "Tamirde" && (
        <button type="button" className="action-btn action-btn--success" onClick={() => onFinishRepair(d.id)}>
          Hazır
        </button>
      )}
      {d.durum === "Hazır" && (
        <button type="button" className="action-btn action-btn--success" onClick={() => onDeliver(d.id)}>
          Teslim Et
        </button>
      )}
      {d.durum === "Teslim Edildi" && <span className="action-done">Tamamlandı</span>}
      <button type="button" className="action-btn action-btn--ghost" onClick={() => onEditToggle(d.id)}>
        {editingId === d.id ? "Kapat" : "Düzenle"}
      </button>
      <button type="button" className="action-btn action-btn--danger" onClick={() => onDelete(d.id)}>
        Sil
      </button>
    </div>
  );

  const renderRowCells = (d) => (
    <>
      <td data-label="Referans No" className="ref-cell">
        <span className="ref-no">{getReferansNo(d)}</span>
      </td>
      <td data-label="Müşteri">{d.adSoyad || "—"}</td>
      <td data-label="Tür">{d.cihazTuru || "—"}</td>
      <td data-label="Marka">{d.marka}</td>
      <td data-label="Model">{d.model}</td>
      <td data-label="İşlem">
        {editingId === d.id ? (
          <select value={d.islem || ""} onChange={(e) => onInputChange(d.id, "islem", e.target.value)}>
            <option value="">Sorun Seç</option>
            <option>Ekran Kırık</option>
            <option>Pil Sorunu</option>
            <option>Şarj Soketi</option>
            <option>Kamera Arızası</option>
            <option>Hoparlör Sorunu</option>
            <option>Yazılım Sorunu</option>
            <option>Anakart Arızası</option>
            <option>Su Hasarı</option>
            <option>Diğer</option>
          </select>
        ) : (
          d.islem || d.arizaNot || "—"
        )}
      </td>
      <td data-label="Fiyat">
        <div className="price-box">
          <button
            type="button"
            onClick={() => onInputChange(d.id, "fiyat", Math.max(0, Number(d.fiyat || 0) - 50))}
          >
            -
          </button>
          <input
            type="number"
            value={d.fiyat ?? 0}
            onChange={(e) => onInputChange(d.id, "fiyat", e.target.value)}
          />
          <button
            type="button"
            onClick={() => onInputChange(d.id, "fiyat", Number(d.fiyat || 0) + 50)}
          >
            +
          </button>
        </div>
      </td>
      <td data-label="Durum">
        <StatusBadge durum={d.durum} />
      </td>
      <td data-label="Aksiyon">{renderActions(d)}</td>
    </>
  );

  return (
    <>
      <div className="device-cards-mobile">
        {devices.map((d) => (
          <article key={d.id} className="device-card">
            <div className="device-card__header">
              <div>
                <span className="device-card__ref-label">Referans No</span>
                <strong className="ref-no">{getReferansNo(d)}</strong>
              </div>
              <StatusBadge durum={d.durum} />
            </div>
            <p>
              <b>{d.marka} {d.model}</b>
              {d.cihazTuru && <span className="device-card__type"> · {d.cihazTuru}</span>}
            </p>
            {d.adSoyad && <p className="device-card__meta">Müşteri: {d.adSoyad}</p>}
            <p className="device-card__meta">İşlem: {d.islem || d.arizaNot || "—"}</p>
            <p className="device-card__meta">Fiyat: {d.fiyat || 0} ₺</p>
            {editingId === d.id && (
              <select
                className="device-card__select"
                value={d.islem || ""}
                onChange={(e) => onInputChange(d.id, "islem", e.target.value)}
              >
                <option value="">Sorun Seç</option>
                <option>Ekran Kırık</option>
                <option>Pil Sorunu</option>
                <option>Şarj Soketi</option>
                <option>Kamera Arızası</option>
                <option>Hoparlör Sorunu</option>
                <option>Yazılım Sorunu</option>
                <option>Anakart Arızası</option>
                <option>Su Hasarı</option>
                <option>Diğer</option>
              </select>
            )}
            <div className="price-box device-card__price">
              <button type="button" onClick={() => onInputChange(d.id, "fiyat", Math.max(0, Number(d.fiyat || 0) - 50))}>-</button>
              <input
                type="number"
                value={d.fiyat ?? 0}
                onChange={(e) => onInputChange(d.id, "fiyat", e.target.value)}
              />
              <button type="button" onClick={() => onInputChange(d.id, "fiyat", Number(d.fiyat || 0) + 50)}>+</button>
            </div>
            {renderActions(d)}
          </article>
        ))}
      </div>

      <div className="table-wrapper table-wrapper--desktop">
        <table className="device-table">
          <thead>
            <tr>
              <th>Referans No</th>
              <th>Müşteri</th>
              <th>Tür</th>
              <th>Marka</th>
              <th>Model</th>
              <th>İşlem</th>
              <th>Fiyat</th>
              <th>Durum</th>
              <th>Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <tr key={d.id}>{renderRowCells(d)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default ResponsiveDeviceList;
