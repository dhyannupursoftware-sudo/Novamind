import axios, { AxiosError } from "axios";
import type { ApiValidationError } from "../types/api";

const getBaseUrl = (): string => {
  const envUrl =
    import.meta.env.VITE_API_URL ||
    "https://novamind-backend-mm0f.onrender.com";

  const trimmed = envUrl.replace(/\/+$/, "");

  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("novamind.auth.token") ||
    sessionStorage.getItem("novamind.auth.token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function setAuthToken(token: string | null): void {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

export function errorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error) {
      return error.message;
    }

    return "Something went wrong. Please try again.";
  }

  const axiosError = error as AxiosError<ApiValidationError>;

  if (!axiosError.response) {
    return "Unable to connect to NovaMind server. Please try again.";
  }

  const payload = axiosError.response.data;

  if (payload && typeof payload === "object") {
    if ("errors" in payload && payload.errors) {
      const values = Object.values(payload.errors);

      if (
        values.length &&
        Array.isArray(values[0]) &&
        values[0].length
      ) {
        return values[0][0];
      }
    }

    if ("message" in payload && typeof payload.message === "string") {
      return payload.message;
    }
  }

  return axiosError.message || "Something went wrong.";
}

export default api;