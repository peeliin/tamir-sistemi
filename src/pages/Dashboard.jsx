import React from "react";
import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard">

      <h2>Genel Bakış</h2>

      <div className="cards">

        <div className="card">
          <h3>Beklemede</h3>
          <p>5</p>
        </div>

        <div className="card">
          <h3>Tamirde</h3>
          <p>8</p>
        </div>

        <div className="card">
          <h3>Hazır</h3>
          <p>3</p>
        </div>

        <div className="card">
          <h3>Toplam</h3>
          <p>24</p>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;