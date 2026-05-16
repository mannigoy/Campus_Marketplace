import { useEffect, useState } from "react";
import "../styles/navbar_footer.css";

export default function Footer({
  brandName = "Campus Marketplace",
  brandSub = "CIT-U Official Store",
  brandDescription = "The official online store for Cebu Institute of Technology - University students. Quality uniforms, merchandise, and school supplies.",
  quickLinks = [
    { label: "Shop", href: "#" },
    { label: "My Orders", href: "/my-orders" },
    { label: "Notifications", href: "#" },
    { label: "Sell with Us", href: "/seller-application"},
  ],
  contactInfo = [
    { icon: "📍", text: "CIT-U Campus, Cebu City" },
    { icon: "📞", text: "(032) 261-7900" },
    { icon: "✉️", text: "marketplace@cit.edu" },
  ],
  socialLinks = [
    { label: "F", name: "Facebook", href: "#" },
    { label: "In", name: "Instagram", href: "#" },
    { label: "T", name: "Twitter", href: "#" },
  ],
  followTagline = "Stay updated with new products and exclusive deals!",
  copyrightText = "© 2026 CIT-U Campus Marketplace. All rights reserved.",
}) {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = width < 768;
  const isTablet = width < 1024;

  const footerSizeClass = isMobile ? "mobile" : isTablet ? "tablet" : "";

  return (
    <footer className={`brand-bg footer ${footerSizeClass}`}>
      <div className={`footer-grid ${isMobile ? "mobile" : ""}`}>
        {/* Brand Section */}
        <div>
          <div className="brand-title-bold">{brandName}</div>
          <div className="brand-title-sub footer-brand-sub">{brandSub}</div>
          <p className="footer-muted">{brandDescription}</p>
        </div>

        {/* Quick Links */}
        <div>
          <p className="footer-title">Quick Links</p>
          {quickLinks.map((link) => (
            <a key={link.label} href={link.href} className="footer-link">
              {link.label}
            </a>
          ))}
        </div>

        {/* Contact */}
        <div>
          <p className="footer-title">Contact Us</p>
          {contactInfo.map((item) => (
            <div key={item.text} className="footer-contact">
              <span className="footer-contact-icon">{item.icon}</span>
              <span className="footer-contact-text">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Follow Us */}
        <div>
          <p className="footer-title">Follow Us</p>
          <div className="social-links-container">
            {socialLinks.map((s) => (
              <a
                key={s.name}
                href={s.href || "#"}
                title={s.name}
                className="social-btn"
              >
                {s.label}
              </a>
            ))}
          </div>
          <p className="footer-muted">{followTagline}</p>
        </div>
      </div>

      <hr className="footer-divider" />
      <p className="footer-copy">{copyrightText}</p>
    </footer>
  );
}