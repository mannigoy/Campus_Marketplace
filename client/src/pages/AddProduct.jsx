import { useState } from "react";
import axios from "axios";
import { Card } from "../components/Shared";
import { useAuth } from "../AuthContext";

const API_BASE = "http://localhost:8080/api";

const MAX_IMAGE_SIZE_MB = 30;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dlljmtv5g";
const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";
const CLOUDINARY_FOLDER =
  import.meta.env.VITE_CLOUDINARY_FOLDER || "campus_marketplace";

const CATEGORY_OPTIONS = [
  "Food and Beverages",
  "Stickers and Pins",
  "CIT-U Official Items",
  "Other",
];

export default function AddProduct({ mode = "seller", stores = [], onSuccess, onCancel }) {
  const { token } = useAuth();
  const isAdmin = mode === "admin";

  const [form, setForm] = useState({
    storeId: "",
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    imageUrl: "",
    category: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError("");
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please choose an image file.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setFormError(`Max file size is ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleUploadImage = async () => {
    if (!imageFile) return;

    if (!CLOUDINARY_UPLOAD_PRESET) {
      setFormError("Cloudinary preset missing.");
      return;
    }

    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", imageFile);
      fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      fd.append("folder", CLOUDINARY_FOLDER);

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        fd
      );

      setForm((prev) => ({
        ...prev,
        imageUrl: res.data.secure_url,
      }));
    } catch {
      setFormError("Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isAdmin && !form.storeId) {
      return setFormError("Store is required.");
    }
    if (!form.name.trim()) return setFormError("Product name is required.");
    if (!form.price) return setFormError("Price is required.");
    if (!form.stockQuantity) return setFormError("Stock quantity is required.");
    if (!form.imageUrl) return setFormError("Upload image first.");

    setSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        imageUrl: form.imageUrl,
        category: form.category,
      };
      if (isAdmin) {
        payload.storeId = Number(form.storeId);
      }

      const endpoint = isAdmin ? `${API_BASE}/admin/products` : `${API_BASE}/seller/products`;
      const res = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onSuccess?.(res.data);
    } catch (err) {
      setFormError(err?.response?.data?.error || "Failed to add product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card style={{ marginBottom: 16 }}>
      <form
        onSubmit={handleSubmit}
        style={{ padding: "16px 20px", display: "grid", gap: 12 }}
      >
        {isAdmin && (
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 600 }}>Store</label>
            <select
              name="storeId"
              value={form.storeId}
              onChange={handleFormChange}
              style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
            >
              <option value="">Select store</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.storeName || `Store ${store.id}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Name */}
        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontWeight: 600 }}>Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleFormChange}
            placeholder="Product name"
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
          />
        </div>

        {/* Description */}
        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontWeight: 600 }}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleFormChange}
            rows={3}
            placeholder="Short description"
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
          />
        </div>

        {/* Price */}
        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontWeight: 600 }}>Price</label>
          <input
            name="price"
            type="number"
            step="0.01"
            value={form.price}
            onChange={handleFormChange}
            placeholder="0.00"
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
          />
        </div>

        {/* Stock */}
        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontWeight: 600 }}>Stock Quantity</label>
          <input
            name="stockQuantity"
            type="number"
            value={form.stockQuantity}
            onChange={handleFormChange}
            placeholder="0"
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
          />
        </div>

        {/* Category */}
        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontWeight: 600 }}>Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleFormChange}
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
          >
            <option value="">Select a category</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Image */}
        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontWeight: 600 }}>Image</label>
          <input type="file" accept="image/*" onChange={handleImageSelect} />

          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                width: 120,
                height: 120,
                objectFit: "cover",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
              }}
            />
          )}

          <button
            type="button"
            className="cm-btn-ghost"
            onClick={handleUploadImage}
            disabled={!imageFile || uploading}
          >
            {uploading
              ? "Uploading..."
              : form.imageUrl
              ? "Re-upload Image"
              : "Upload Image"}
          </button>

          {form.imageUrl && (
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Image uploaded.
            </div>
          )}
        </div>

        {/* Error */}
        {formError && (
          <div
            style={{
              color: "#b91c1c",
              background: "#fef2f2",
              padding: "8px 12px",
              borderRadius: 8,
            }}
          >
            {formError}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="submit"
            className="cm-btn-primary"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save Product"}
          </button>

          <button type="button" className="cm-btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </Card>
  );
}