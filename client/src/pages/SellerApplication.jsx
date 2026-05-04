import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const API_BASE = "http://localhost:8080/api";

export default function SellerApplication() {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ shopName: "", reason: "" });
  const [studentIdImage, setStudentIdImage] = useState("");
  const [studentIdPreview, setStudentIdPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!user) {
    navigate("/");
    return null;
  }

  if (user.role !== "CUSTOMER") {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px" }}>
        <h1>Seller Application</h1>
        <p style={{ color: "#6b7280" }}>
          Your account is already {user.role.toLowerCase()}. No application is needed.
        </p>
      </div>
    );
  }

  if (user.applicationStatus === "PENDING") {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px" }}>
        <h1>Seller Application</h1>
        <p style={{ color: "#6b7280" }}>
          Your application is pending review. We will notify you once it is approved.
        </p>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setStudentIdImage("");
      setStudentIdPreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Student ID must be an image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setStudentIdImage(result);
      setStudentIdPreview(result);
    };
    reader.onerror = () => {
      setError("Failed to read the file.");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.shopName.trim()) {
      setError("Shop name is required.");
      return;
    }

    if (!studentIdImage) {
      setError("Please upload your student ID image.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/seller/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shopName: form.shopName,
          reason: form.reason,
          studentIdImage,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit application.");
        return;
      }
      updateUser({ applicationStatus: "PENDING" });
      setSuccess("Application submitted. Awaiting admin approval.");
      navigate("/dashboard");
    } catch {
      setError("Cannot reach server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px" }}>
      <h1>Seller Application</h1>
      <p style={{ color: "#6b7280" }}>
        Submit your shop details and student ID for admin review.
      </p>

      {error && (
        <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "12px 16px", borderRadius: 8 }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: "#ecfdf5", color: "#065f46", padding: "12px 16px", borderRadius: 8 }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16, marginTop: 16 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <label htmlFor="shopName" style={{ fontWeight: 600 }}>Shop Name</label>
          <input
            id="shopName"
            name="shopName"
            value={form.shopName}
            onChange={handleChange}
            placeholder="e.g. Wildcat Merch"
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label htmlFor="reason" style={{ fontWeight: 600 }}>Store Description</label>
          <textarea
            id="reason"
            name="reason"
            value={form.reason}
            onChange={handleChange}
            placeholder="Tell us what you plan to sell"
            rows={4}
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label htmlFor="studentId" style={{ fontWeight: 600 }}>Student ID (image)</label>
          <input id="studentId" type="file" accept="image/*" onChange={handleFileChange} />
          {studentIdPreview && (
            <img
              src={studentIdPreview}
              alt="Student ID preview"
              style={{ maxWidth: "100%", borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
          )}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#111827",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            style={{
              background: "white",
              color: "#111827",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </form>
    </div>
  );
}
