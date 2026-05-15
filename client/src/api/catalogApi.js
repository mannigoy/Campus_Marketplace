import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080/api";

const unwrapList = (data, key) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data[key])) return data[key];
  return [];
};

const unwrapMeta = (data, items) => {
  return {
    page: data?.page ?? 0,
    size: data?.size ?? items.length,
    total: data?.total ?? items.length,
    totalPages: data?.totalPages ?? 1,
  };
};

export const getProducts = async (params = {}) => {
  const res = await axios.get(`${API_BASE}/products`, { params });
  const items = unwrapList(res.data, "products");
  return { items, meta: unwrapMeta(res.data, items) };
};

export const getCategories = async () => {
  const res = await axios.get(`${API_BASE}/categories`);
  return unwrapList(res.data, "categories");
};

export const getCategory = async (categoryId) => {
  const res = await axios.get(`${API_BASE}/categories/${categoryId}`);
  return res.data;
};

export const getCategoryProducts = async (categoryId, params = {}) => {
  const res = await axios.get(`${API_BASE}/categories/${categoryId}/products`, { params });
  const items = unwrapList(res.data, "products");
  return { items, meta: unwrapMeta(res.data, items) };
};

export const getShops = async () => {
  const res = await axios.get(`${API_BASE}/shops`);
  return unwrapList(res.data, "shops");
};

export const getShop = async (shopId) => {
  const res = await axios.get(`${API_BASE}/shops/${shopId}`);
  return res.data;
};

export const getShopProducts = async (shopId, params = {}) => {
  const res = await axios.get(`${API_BASE}/shops/${shopId}/products`, { params });
  const items = unwrapList(res.data, "products");
  return { items, meta: unwrapMeta(res.data, items) };
};
