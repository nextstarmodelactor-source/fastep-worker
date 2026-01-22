export const API_BASE =
  import.meta.env.VITE_API_URL || "https://fastep-worker.onrender.com/api";

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    throw new Error(
      (data && data.message) ? data.message : `API Error ${res.status}`
    );
  }
  return data;
}
