const BASE_URL = "http://localhost:8080/ecommerce";
export default BASE_URL;

// Helper: authenticated fetch that handles 401 redirects
export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    ...options,
  });
  return res;
}