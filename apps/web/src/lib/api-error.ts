export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Maps API response bodies to user-facing messages (never raw JSON). */
export function parseApiErrorMessage(status: number, bodyText: string): string {
  if (status >= 500) {
    return 'Something went wrong. Please try again later.';
  }

  if (bodyText.trim()) {
    try {
      const body = JSON.parse(bodyText) as { message?: string | string[] };
      if (Array.isArray(body.message)) {
        const joined = body.message.filter(Boolean).join('. ').trim();
        if (joined) return joined;
      }
      if (typeof body.message === 'string' && body.message.trim()) {
        return body.message.trim();
      }
    } catch {
      // non-JSON body
    }
  }

  if (status === 401) return 'Please sign in to continue.';
  if (status === 403) return 'You do not have permission to do that.';
  if (status === 404) return 'The requested resource was not found.';
  if (status === 400) return 'Invalid request. Please check your input and try again.';

  return 'Request failed. Please try again.';
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message && !error.message.startsWith('API ')) {
    return error.message;
  }
  return fallback;
}
