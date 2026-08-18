/**
 * Typed application error class.
 * Used in services and Server Actions to return structured errors
 * without leaking internal details to the client.
 */

export type AppErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'DB_ERROR'
  | 'STORAGE_ERROR'
  | 'RATE_LIMITED'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'INACTIVE_USER'
  | 'INTERNAL_ERROR'

export class AppError extends Error {
  readonly code: AppErrorCode
  readonly status: number
  readonly details?: unknown

  constructor(
    code: AppErrorCode,
    message: string,
    details?: unknown,
    status?: number
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
    this.status = status ?? AppError.defaultStatus(code)
  }

  static defaultStatus(code: AppErrorCode): number {
    const map: Record<AppErrorCode, number> = {
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      VALIDATION_ERROR: 422,
      CONFLICT: 409,
      DB_ERROR: 500,
      STORAGE_ERROR: 500,
      RATE_LIMITED: 429,
      INVALID_TOKEN: 400,
      TOKEN_EXPIRED: 400,
      INACTIVE_USER: 403,
      INTERNAL_ERROR: 500,
    }
    return map[code]
  }

  toClientError(): { code: AppErrorCode; message: string } {
    return { code: this.code, message: this.message }
  }
}

/**
 * Standard result type for Server Actions.
 * Server Actions should always return this (never throw to the client).
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: { code: AppErrorCode; message: string }; fieldErrors?: Record<string, string[]> }

/**
 * Wraps a server action body in a try/catch and returns ActionResult.
 */
export async function withActionError<T>(
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await fn()
    return { success: true, data }
  } catch (err) {
    if (err instanceof AppError) {
      return { success: false, error: err.toClientError() }
    }
    console.error('[Server Action Error]', err)
    return {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' },
    }
  }
}

/** Safe user-facing messages for DB errors */
export function mapSupabaseError(code: string | undefined): string {
  switch (code) {
    case '23505':
      return 'This record already exists.'
    case '23503':
      return 'This action references a record that no longer exists.'
    case '23514':
      return 'This action violates a business rule.'
    case 'PGRST301':
      return 'You do not have permission to access this resource.'
    default:
      return 'A database error occurred. Please try again.'
  }
}
