import { useState } from "react";
import Sidebar from "../../components/Sidebar";

// Import your dashboard pages
import DashboardPage from "./AdminDashboard";
import ProductsPage from "./Products";
import SellerApplication from "./SellerApplications";
import Stores from "./Stores";
import Users from "./Users";

export default function AdminSide() { 

  const [page, setPage] = useState("dashboard");

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardPage onNavigate={setPage} />;
      case "users": return <Users />;
      case "pending": return <SellerApplication />;
      case "stores": return <Stores />;
      case "products": return <ProductsPage />;
       default: return <DashboardPage onNavigate={setPage} />;
    }
  };

  return (
    // We override the height to 100vh so the dashboard fills the screen
    <div style={{ display: "flex", minHeight: "80vh", background: "#fafafa", overflow: "hidden" }}>
      <Sidebar active={page} onNavigate={setPage} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
       
        {renderPage()}
      </div>
    </div>
  );
}