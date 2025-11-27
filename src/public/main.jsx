import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LiveLog from "./LiveLog.jsx";
import Layout from "../Layout.jsx";
import "../index.css";
import DashboardHome from "./DashboardHome.jsx";
import WeddingDashboard from "../pages/WeddingDashboard.jsx";
import Broadcast from "../pages/Broadcast.jsx";

function HomePage() {
  return (
    <div className="space-y-8 fade-slide">
      <DashboardHome />
      <div className="grid gap-6 lg:grid-cols-2">
        <LiveLog />
        <WeddingDashboard />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/broadcast" element={<Broadcast />} />
        <Route path="/wedding" element={<WeddingDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  </BrowserRouter>
);
