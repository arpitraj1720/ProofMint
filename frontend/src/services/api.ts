export interface User {
  _id: string;
  name: string;
  username?: string;
  email: string;
  createdAt: string;
  registeredCount?: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface ImageRecord {
  _id?: string;
  hash: string;
  owner?: string;
  imageUrl: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  uploadedAt?: string;
  txHash?: string;
  aiLabel?: string;
  aiConfidence?: number;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  imageHash?: string;
  txHash?: string;
  image?: ImageRecord;
}

export interface VerifyResponse {
  success: boolean;
  authentic: boolean;
  status: "verified" | "not_found";
  title: string;
  message: string;
  imageHash?: string;
  proofDetails?: {
    blockchain?: string;
    txHash?: string | null;
    uploadedAt?: string | null;
    fileName?: string;
    fileSize?: number;
    imageUrl?: string | null;
  } | null;
  note?: string;
}

export class ApiError extends Error {
  status: number;
  isDuplicate: boolean;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.isDuplicate = status === 409;
  }
}

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.trim() !== "")
    ? import.meta.env.VITE_API_BASE_URL
    : import.meta.env.PROD
      ? "https://proofmint-pwcy.onrender.com"
      : "http://localhost:3001";

const TOKEN_KEY = "proofmint_auth_token";

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Local storage unavailable
  }
}

export function clearAuthToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Local storage unavailable
  }
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    if (err.message === "Failed to fetch" || err.message.toLowerCase().includes("failed to fetch")) {
      return "Unable to connect to backend server. If the backend is hosted on Render free tier, it may take 30–50 seconds to wake up from sleep. Please wait a moment and try again.";
    }
    return err.message;
  }
  return "Failed to connect to backend server.";
}

/**
 * Register a new user account with username, email, and password.
 * Endpoint: POST /api/auth/register
 */
export async function registerUser(
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: username, username, email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        data.message || `Registration failed with status ${res.status}`;
      throw new ApiError(message, res.status);
    }

    if (data.token) {
      setAuthToken(data.token);
    }

    return data as AuthResponse;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(getErrorMessage(err), 0);
  }
}

/**
 * Log in an existing user with username or email, and password.
 * Endpoint: POST /api/auth/login
 */
export async function loginUser(
  identifier: string,
  password: string
): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier,
        email: identifier,
        username: identifier,
        password,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        data.message || `Login failed with status ${res.status}`;
      throw new ApiError(message, res.status);
    }

    if (data.token) {
      setAuthToken(data.token);
    }

    return data as AuthResponse;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(getErrorMessage(err), 0);
  }
}

/**
 * Authenticate with Google ID Token / Credential / Access Token.
 * Endpoint: POST /api/auth/google
 */
export async function loginWithGoogle(
  params: string | { idToken?: string; credential?: string; accessToken?: string }
): Promise<AuthResponse> {
  const payload =
    typeof params === "string"
      ? { idToken: params, credential: params }
      : {
          idToken: params.idToken || params.credential,
          credential: params.credential || params.idToken,
          accessToken: params.accessToken,
        };

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        data.message || `Google sign in failed with status ${res.status}`;
      throw new ApiError(message, res.status);
    }

    if (data.token) {
      setAuthToken(data.token);
    }

    return data as AuthResponse;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(getErrorMessage(err), 0);
  }
}

/**
 * Fetch current authenticated user's profile and stats.
 * Endpoint: GET /api/auth/me
 */
export async function getMe(): Promise<{ success: boolean; user: User }> {
  const token = getAuthToken();
  if (!token) {
    throw new ApiError("No authentication token found", 401);
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401) {
        clearAuthToken();
      }
      const message =
        data.message || `Failed to fetch profile (${res.status})`;
      throw new ApiError(message, res.status);
    }

    return data as { success: boolean; user: User };
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(getErrorMessage(err), 0);
  }
}

/**
 * Upload and register an image on-chain and in MongoDB.
 * Protected Endpoint: POST /api/images
 * Content-Type: multipart/form-data
 */
export async function registerImage(file: File): Promise<RegisterResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new ApiError("Please log in to register images.", 401);
  }

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch(`${API_BASE_URL}/api/images`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        data.message ||
        (res.status === 409
          ? "This image has already been uploaded and registered."
          : `Upload failed with status ${res.status}`);
      throw new ApiError(message, res.status);
    }

    return data as RegisterResponse;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(getErrorMessage(err), 0);
  }
}

/**
 * Verify whether an image's SHA-256 hash exists on the blockchain.
 * Public Endpoint: POST /api/images/verify
 * Content-Type: multipart/form-data
 */
export async function verifyImage(file: File): Promise<VerifyResponse> {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch(`${API_BASE_URL}/api/images/verify`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        data.message || `Verification failed with status ${res.status}`;
      throw new ApiError(message, res.status);
    }

    return data as VerifyResponse;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(getErrorMessage(err), 0);
  }
}

/**
 * Fetch authenticated user's registered images for the Dashboard.
 * Protected Endpoint: GET /api/images
 */
export async function getImages(): Promise<ImageRecord[]> {
  const token = getAuthToken();
  if (!token) {
    throw new ApiError("Please log in to access your images.", 401);
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/images`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401) {
        clearAuthToken();
      }
      const message =
        data.message || `Failed to fetch images (${res.status})`;
      throw new ApiError(message, res.status);
    }

    if (Array.isArray(data)) {
      return data;
    }

    if (data.images && Array.isArray(data.images)) {
      return data.images;
    }

    return [];
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(getErrorMessage(err), 0);
  }
}
