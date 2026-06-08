import "./DashboardCard.css";

function DashboardCard({ title, count, active, onClick }) {
  return (
    <button
      type="button"
      className={`dashboard-card ${active ? "dashboard-card--active" : ""}`}
      onClick={onClick}
    >
      <span className="dashboard-card__title">{title}</span>
      <span className="dashboard-card__count">{count}</span>
    </button>
  );
}

export default DashboardCard;
