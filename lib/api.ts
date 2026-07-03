import { authStorage } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://medora-backend-ai.vercel.app";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = authStorage.getToken();
  
  const headers = new Headers(options.headers || {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  // Set Content-Type only if it's not FormData
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || `Request failed with status ${response.status}`;
    
    console.error(`[API ERROR] ${options.method || 'GET'} ${endpoint} -> ${response.status}:`, errorData);

    // If token is invalid (e.g. backend changed), clear auth and redirect
    if (message.toLowerCase().includes("invalid token")) {
      authStorage.clear();
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
    
    throw new Error(message);
  }

  return response.json();
}
