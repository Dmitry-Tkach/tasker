// The API's error contract, shared by the server (which produces it) and the
// client (which parses it). Every non-2xx response from /api has this body.

export type ApiErrorCode =
  | 'VALIDATION'
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_TAKEN'
  | 'UNAUTHORIZED'
  | 'RECOVERY_LINK_INVALID'
  | 'RATE_LIMITED'
  | 'NOT_FOUND'
  | 'UPSTREAM'
  | 'NETWORK'
  | 'INTERNAL';

export type ApiErrorInfo = {
  code: ApiErrorCode;
  /** Safe to show to the user. */
  message: string;
  /** Per-field messages, keyed by input name. */
  fields?: Record<string, string>;
  /** For RATE_LIMITED: seconds until the request may be retried. */
  retryAfter?: number;
};

export type ApiErrorBody = { error: ApiErrorInfo };

export const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

/** Thrown by the client for any failed API call. `status` is 0 for network failures. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly fields?: Record<string, string>;
  readonly retryAfter?: number;

  constructor(status: number, { code, message, fields, retryAfter }: ApiErrorInfo) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
    this.retryAfter = retryAfter;
  }
}

/**
 * Awaits an RPC call and returns its JSON body, or throws an ApiError built
 * from the error contract (falling back to a generic message for non-JSON
 * responses and network failures).
 */
export async function unwrap<T>(request: Promise<Response>): Promise<T> {
  let res: Response;
  try {
    res = await request;
  } catch {
    throw new ApiError(0, {
      code: 'NETWORK',
      message: "Can't reach the server. Check your connection and try again.",
    });
  }

  if (res.ok) return (await res.json()) as T;

  const body = (await res.json().catch(() => null)) as Partial<ApiErrorBody> | null;
  throw new ApiError(res.status, body?.error ?? { code: 'INTERNAL', message: GENERIC_ERROR_MESSAGE });
}
