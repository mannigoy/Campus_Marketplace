import { useState } from "react";
import Sidebar from "../../components/Sidebar";

// Import your dashboard pages
import DashboardPage from "./Dashboard";
import ProductsPage from "./ProductsPage";
import AddProductPage from "./AddProductPage";
import OrdersPage from "./Orders";
import AnalyticsPage from "./Analytics";
import SettingsPage from "./SettingsPage";

export default function SellerSide() {  // <-- Renamed from App to SellerSide
  // This handles the navigation strictly inside the Seller Dashboard
  const [page, setPage] = useState("dashboard");

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardPage onNavigate={setPage} />;
      case "products": return <ProductsPage />;
      case "add-product": return <AddProductPage onNavigate={setPage} />;
      case "orders": return <OrdersPage />;
      case "analytics": return <AnalyticsPage />;
      case "settings": return <SettingsPage />;
      default: return <DashboardPage onNavigate={setPage} />;
    }
  };

  return (
    // We override the height to 100vh so the dashboard fills the screen
    <div style={{ display: "flex", height: "100vh", background: "#fafafa", overflow: "hidden" }}>
      <Sidebar active={page} onNavigate={setPage} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
       
        {renderPage()}
      </div>
    </div>
  );
}