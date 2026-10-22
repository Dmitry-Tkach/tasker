import type { Context, ErrorHandler, NotFoundHandler, ValidationTargets } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { zValidator } from '@hono/zod-validator';
import type * as z from 'zod';
import { AppwriteException } from 'node-appwrite';
import {
  GENERIC_ERROR_MESSAGE,
  type ApiErrorBody,
  type ApiErrorCode,
  type ApiErrorInfo,
} from '@/lib/api-error';

/** Throw from a route to send `{ error }` with the given status (handled by `onError`). */
export class ApiHttpError extends Error {
  constructor(
    readonly status: ContentfulStatusCode,
    readonly info: ApiErrorInfo,
  ) {
    super(info.message);
    this.name = 'ApiHttpError';
  }
}

const RATE_LIMITED = new ApiHttpError(429, {
  code: 'RATE_LIMITED',
  message: 'Too many attempts. Please wait a minute and try again.',
});

const UPSTREAM = new ApiHttpError(502, {
  code: 'UPSTREAM',
  message: 'The service is temporarily unavailable. Please try again.',
});

export const INVALID_CREDENTIALS = new ApiHttpError(401, {
  code: 'INVALID_CREDENTIALS',
  message: 'Incorrect email or password.',
});

export const UNAUTHORIZED = new ApiHttpError(401, { code: 'UNAUTHORIZED', message: 'Unauthorized' });

export const RECOVERY_LINK_INVALID = new ApiHttpError(400, {
  code: 'RECOVERY_LINK_INVALID',
  message: 'This reset link is invalid or has expired.',
});

// Appwrite password-policy errors that are safe to show on the password field.
const PASSWORD_POLICY_MESSAGES: Record<string, string> = {
  password_recently_used: 'Choose a password you haven’t used recently.',
  password_personal_data: 'Your password can’t contain your name or email.',
};

// 'recovery-request' sends the reset email; 'recovery' completes the reset.
type AppwriteContext = 'login' | 'register' | 'recovery-request' | 'recovery' | 'session';

/**
 * Maps an Appwrite error to a safe public ApiHttpError. Appwrite's own message
 * is logged, never returned. Non-Appwrite errors are rethrown so `onError`
 * turns them into a generic 500.
 */
export function fromAppwrite(e: unknown, context: AppwriteContext): ApiHttpError {
  if (!(e instanceof AppwriteException)) throw e;

  console.error(`[appwrite:${context}]`, e.code, e.type, e.message);

  if (e.code === 429) return RATE_LIMITED;
  if (e.code === 0 || e.code >= 500) return UPSTREAM;

  // One message for every login failure (incl. blocked users) so the response
  // doesn't reveal whether an account exists.
  if (context === 'login' && (e.code === 400 || e.code === 401)) return INVALID_CREDENTIALS;
  if (context === 'session' && e.code === 401) return UNAUTHORIZED;
  if (context === 'recovery' && (e.code === 401 || e.code === 404)) return RECOVERY_LINK_INVALID;

  if (context === 'register' && e.code === 409) {
    const message = 'An account with this email already exists.';
    return new ApiHttpError(409, { code: 'EMAIL_TAKEN', message, fields: { email: message } });
  }

  const passwordMessage = PASSWORD_POLICY_MESSAGES[e.type];
  if (passwordMessage) {
    return new ApiHttpError(400, {
      code: 'VALIDATION',
      message: passwordMessage,
      fields: { password: passwordMessage },
    });
  }

  return new ApiHttpError(500, { code: 'INTERNAL', message: GENERIC_ERROR_MESSAGE });
}

const errorJson = (c: Context, status: ContentfulStatusCode, error: ApiErrorInfo) =>
  c.json<ApiErrorBody>({ error }, status);

/** zValidator that answers invalid input with the standard `VALIDATION` error. */
export const validate = <Target extends keyof ValidationTargets, Schema extends z.ZodType>(
  target: Target,
  schema: Schema,
) =>
  zValidator(target, schema, (result, c) => {
    if (result.success) return;
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      fields[issue.path.join('.')] ??= issue.message;
    }
    // Literal 400 (not errorJson) so this response doesn't widen the routes'
    // inferred success types for the RPC client.
    const body: ApiErrorBody = {
      error: { code: 'VALIDATION', message: 'Please check the highlighted fields.', fields },
    };
    return c.json(body, 400);
  });

const HTTP_EXCEPTION_CODES: Partial<Record<number, ApiErrorCode>> = {
  400: 'VALIDATION',
  401: 'UNAUTHORIZED',
  404: 'NOT_FOUND',
};

export const onError: ErrorHandler = (err, c) => {
  if (err instanceof ApiHttpError) return errorJson(c, err.status, err.info);
  // Hono's own client errors, e.g. a malformed JSON body.
  if (err instanceof HTTPException && err.status < 500) {
    const code = HTTP_EXCEPTION_CODES[err.status] ?? 'INTERNAL';
    return errorJson(c, err.status, { code, message: err.message || GENERIC_ERROR_MESSAGE });
  }
  console.error('[api]', err);
  return errorJson(c, 500, { code: 'INTERNAL', message: GENERIC_ERROR_MESSAGE });
};

export const notFound: NotFoundHandler = (c) => errorJson(c, 404, { code: 'NOT_FOUND', message: 'Not found' });
