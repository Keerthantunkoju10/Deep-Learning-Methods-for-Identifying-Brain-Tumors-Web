// Centralized API Base URL configuration
// - In local development: Defaults to empty string '', which uses Vite's proxy (/api -> http://127.0.0.1:8000).
// - On Netlify with rewrite rule: Defaults to '', which uses Netlify's proxy (/api -> your backend).
// - On Netlify with direct CORS API: Set VITE_API_URL in Netlify dashboard (e.g., https://neuroscan-backend.onrender.com).
export const API_BASE = import.meta.env.VITE_API_URL || '';
