import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <nav className={`brand-bg navbar ${isMobile ? "mobile" : ""}`}>
      <div className="nav-brand">
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
              <button type="button" className="nav-btn">
                Notifications 🔔
              </button>
            )}

            <div className="nav-account">
              <button type="button" className="nav-btn nav-account-btn">
                <span className="nav-account-icon" aria-hidden="true">
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