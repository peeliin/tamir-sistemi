import { getStatusGroup } from "../utils/statusHelpers";
import "./StatusBadge.css";

function StatusBadge({ durum }) {
  const group = getStatusGroup(durum);
  return (
    <span className={`status-badge status-badge--${group}`}>
      {durum || "—"}
    </span>
  );
}

export default StatusBadge;
