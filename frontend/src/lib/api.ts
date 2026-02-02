/**
 * Centralized API client for backend communication.
 * Uses NEXT_PUBLIC_API_URL environment variable.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://i-ascap.onrender.com';

export interface ApiError {
    error: string;
    detail?: string;
}

export class BackendApiError extends Error {
    status: number;
    detail?: string;

    constructor(message: string, status: number, detail?: string) {
        super(message);
        this.name = 'BackendApiError';
        this.status = status;
        this.detail = detail;
    }
}

/**
 * Make a request to the FastAPI backend.
 * @param endpoint - API endpoint path (e.g., '/api/v1/metrics')
 * @param params - Query parameters as URLSearchParams or object
 * @param options - Additional fetch options
 */
export async function fetchFromBackend<T>(
    endpoint: string,
    params?: URLSearchParams | Record<string, string>,
    options?: RequestInit
): Promise<T> {
    const url = new URL(endpoint, BACKEND_URL);

    let queryString = '';

    if (params) {
        const searchParams = params instanceof URLSearchParams
            ? params
            : new URLSearchParams(params);
        queryString = `?${searchParams.toString()}`;
    }

    const response = await fetch(`${BACKEND_URL}${endpoint}${queryString}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.API_KEY || 'dev-secret-key-123',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        let detail: string | undefined;
        try {
            const errorBody = await response.json();
            detail = errorBody.detail || errorBody.error;
        } catch {
            // Ignore JSON parse errors for error response
        }
        throw new BackendApiError(
            `Backend request failed: ${response.status}`,
            response.status,
            detail
        );
    }

    return response.json();
}

/**
 * Helper to build query params, filtering out undefined values.
 */
export function buildParams(params: Record<string, string | number | undefined>): URLSearchParams {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
            searchParams.set(key, String(value));
        }
    }
    return searchParams;
}
