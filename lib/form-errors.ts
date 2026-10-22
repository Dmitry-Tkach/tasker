import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError, GENERIC_ERROR_MESSAGE } from '@/lib/api-error';

/**
 * Shows a failed submit's error on the form: messages for known fields go to
 * those fields (focusing the first one), anything else goes to
 * `errors.root.server` for a form-level alert. Returns the error as an
 * ApiError so callers can react to its `code`.
 */
export function applyServerError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fieldNames: readonly Path<T>[],
): ApiError {
  const apiError =
    error instanceof ApiError
      ? error
      : new ApiError(0, { code: 'INTERNAL', message: GENERIC_ERROR_MESSAGE });

  let focused = false;
  for (const [name, message] of Object.entries(apiError.fields ?? {})) {
    if (!(fieldNames as readonly string[]).includes(name)) continue;
    setError(name as Path<T>, { type: 'server', message }, { shouldFocus: !focused });
    focused = true;
  }

  if (!focused) setError('root.server', { type: apiError.code, message: apiError.message });
  return apiError;
}
