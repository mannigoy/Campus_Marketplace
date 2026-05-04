import React from "react";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
      <h1 style={{ marginBottom: 8 }}>Unauthorized</h1>
      <p style={{ color: "#6b7280" }}>
        You do not have permission to access this page.
      </p>
      <Link to="/" style={{ color: "#111827", textDecoration: "underline" }}>
        Go back home
      </Link>
    </div>
  );
}
