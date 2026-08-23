export interface ImageRecord {
  _id?: string;
  hash: string;
  owner: string;
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
  message: string;
  imageHash?: string;
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
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

/**
 * Upload and register an image on-chain and in MongoDB.
 * Endpoint: POST /api/images
 * Content-Type: multipart/form-data
 */
export async function registerImage(
  file: File,
  owner: string
): Promise<RegisterResponse> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("owner", owner);

  try {
    const res = await fetch(`${API_BASE_URL}/api/images`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        data.message ||
        (res.status === 409
          ? "This image has already been uploaded."
          : `Upload failed with status ${res.status}`);
      throw new ApiError(message, res.status);
    }

    return data as RegisterResponse;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const message =
      err instanceof Error ? err.message : "Failed to connect to backend server.";
    throw new ApiError(message, 0);
  }
}

/**
 * Verify whether an image's SHA-256 hash exists on the blockchain.
 * Endpoint: POST /api/images/verify
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
      const message = data.message || `Verification failed with status ${res.status}`;
      throw new ApiError(message, res.status);
    }

    return data as VerifyResponse;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const message =
      err instanceof Error ? err.message : "Failed to connect to backend server.";
    throw new ApiError(message, 0);
  }
}

/**
 * Fetch all registered images for the Dashboard.
 * Endpoint: GET /api/images
 */
export async function getImages(): Promise<ImageRecord[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/images`, {
      method: "GET",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message = data.message || `Failed to fetch images (${res.status})`;
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
    const message =
      err instanceof Error ? err.message : "Failed to connect to backend server.";
    throw new ApiError(message, 0);
  }
}
