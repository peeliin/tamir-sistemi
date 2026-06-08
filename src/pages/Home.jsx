import React from "react";
import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      <h1>Elektronik Tamir Sistemi</h1>
      <p>Servislerinizi takip edin ve yönetin</p>

      <div className="card-container">
        <div className="card">
          <h2>Müşteri Girişi</h2>
          <p>Cihaz durumunu takip et</p>
          <button>Devam Et</button>
        </div>

        <div className="card">
          <h2>Admin Girişi</h2>
          <p>Paneli yönet</p>
          <button>Devam Et</button>
        </div>
      </div>
    </div>
  );
}

export default Home;