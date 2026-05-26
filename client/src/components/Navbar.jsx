import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../NotificationContext.jsx";
import "../styles/navbar_footer.css";

export default function Navbar({
  links = [
    { label: "Shop", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ],
  brandName = "Campus Marketplace",
  brandSub = "CIT-U Official Store",
  onOrdersClick,
  onSignInClick,
  onLogoutClick, // Added to handle logging out
  onApplySellerClick,
  onSellerDashboardClick,
  isLoggedIn = false, // Added to track auth state
  username = "Wildcat", // Added to personalize the experience
  role = "CUSTOMER",
  applicationStatus = "NONE",
  showNotification = true,
}) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const { notifications, clearNotifications } = useNotifications();

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <nav className={`brand-bg navbar ${isMobile ? "mobile" : ""}`}>
      <div className="nav-brand" >
        <div className="nav-logo">CM</div>
        <div className="nav-title-wrap">
          <div className="brand-title-bold">{brandName}</div>
          <div className="brand-title-sub">{brandSub}</div>
        </div>
      </div>

      <div className={`nav-links ${isMobile ? "mobile" : ""}`}>
        {/* Universal Links (Shop, About, Contact) always show */}
        {links.map(({ label, href, onClick }) =>
          href ? (
            <Link key={label} to={href} className="nav-btn">
              {label}
            </Link>
          ) : (
            <button
              key={label}
              type="button"
              className="nav-btn"
              onClick={onClick}
            >
              {label}
            </button>
          )
        )}

        {/* --- CONDITIONAL RENDERING STARTS HERE --- */}
        {isLoggedIn ? (
          // WHAT TO SHOW WHEN LOGGED IN
          <>
            <button type="button" className="nav-btn" onClick={onOrdersClick}>
              My Orders
            </button>

            {/*
            {role === "CUSTOMER" && applicationStatus !== "PENDING" && (
              <button type="button" className="nav-btn" onClick={onApplySellerClick}>
                Apply to be Seller
              </button>
            )}
            */}


             


            {role === "CUSTOMER" && applicationStatus === "PENDING" && (
              <button type="button" className="nav-btn" disabled>
                Application Pending
              </button>
            )}

            {role === "SELLER" && (
              <button type="button" className="nav-btn" onClick={onSellerDashboardClick}>
                Go to Seller Dashboard
              </button>
            )}

            {showNotification && !isMobile && (
              <Link to="/cart" className="nav-btn">
                Cart 🛒
              </Link>
            )}

            {showNotification && !isMobile && (
              <div className="nav-notification-wrapper">
                <button
                  type="button"
                  className="nav-btn nav-notification-btn"
                  onClick={() => setShowNotificationPanel((prev) => !prev)}
                  aria-expanded={showNotificationPanel}
                >
                  Notifications 🔔
                  {notifications.length > 0 && (
                    <span className="notification-badge">{notifications.length}</span>
                  )}
                </button>

                <div
                  className={`nav-notification-panel ${showNotificationPanel ? "open" : ""}`}
                  role="dialog"
                  aria-label="Notification center"
                >
                  <div className="nav-notification-header">
                    <span>Recent notifications</span>
                    <button
                      type="button"
                      className="nav-notification-clear"
                      onClick={() => {
                        clearNotifications();
                        setShowNotificationPanel(false);
                      }}
                    >
                      Clear
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="nav-notification-empty">No new notifications</div>
                  ) : (
                    notifications.map((item) => (
                      <div key={item.id} className="nav-notification-item">
                        <div>
                          <strong>{item.title}</strong>
                          <p>{item.message}</p>
                        </div>
                        <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="nav-account">
              <button type="button" className="nav-btn nav-account-btn" >
                <span className="nav-account-icon" aria-hidden="true" >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                    <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.34 0-6 1.66-6 4v2h12v-2c0-2.34-2.66-4-6-4Z" />
                  </svg>
                </span>
                <span className="nav-account-name">{username}</span>
              </button>

              <div className="nav-account-menu" role="menu" aria-label="Account menu">
                <Link to="/dashboard" className="nav-account-item" role="menuitem">
                  My account
                </Link>
                <button type="button" className="nav-account-item" onClick={onLogoutClick} role="menuitem">
                  Log out
                </button>
              </div>
            </div>
          </>
        ) : (
          // WHAT TO SHOW WHEN GUEST (LOGGED OUT)
          <>
            <button type="button" className="nav-btn nav-account-btn nav-signin-btn" onClick={onSignInClick}>
              <span className="nav-account-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                  <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.34 0-6 1.66-6 4v2h12v-2c0-2.34-2.66-4-6-4Z" />
                </svg>
              </span>
              <span className="nav-account-name">Sign In</span>
            </button>
          </>
        )}
        {/* --- CONDITIONAL RENDERING ENDS HERE --- */}

      </div>
    </nav>
  );
}