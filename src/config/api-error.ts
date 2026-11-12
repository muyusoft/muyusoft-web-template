export const NETWORK_ERROR = "NETWORK_ERROR";
export const REQUEST_ABORTED = "REQUEST_ABORTED";

const SERVER_ERROR_MIN_STATUS = 500;
const CODE_BY_STATUS: Readonly<Record<number, string>> = {
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  429: "RATE_LIMIT_EXCEEDED",
};

interface ApiErrorInit {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}

/** Único tipo de error que el cliente HTTP entrega a los servicios. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;

  constructor({ status, code, message, details }: ApiErrorInit) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function codeForStatus(status: number): string {
  const known = CODE_BY_STATUS[status];
  if (known) return known;
  if (status >= SERVER_ERROR_MIN_STATUS) return "SERVER_ERROR";
  return `HTTP_${status}`;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

// El backend responde a veces JSON { error_code, message, details } y a veces texto plano.
export function fromHttpResponse(status: number, body: unknown): ApiError {
  const parsed = typeof body === "string" ? parseJson(body) : body;
  if (isRecord(parsed)) {
    return new ApiError({
      status,
      code:
        typeof parsed.error_code === "string"
          ? parsed.error_code
          : codeForStatus(status),
      message:
        typeof parsed.message === "string" ? parsed.message : `HTTP ${status}`,
      details: parsed.details,
    });
  }
  const text = typeof parsed === "string" ? parsed.trim() : "";
  return new ApiError({
    status,
    code: codeForStatus(status),
    message: text || `HTTP ${status}`,
  });
}

export const networkError = (message: string): ApiError =>
  new ApiError({ status: 0, code: NETWORK_ERROR, message });

export const abortedError = (): ApiError =>
  new ApiError({
    status: 0,
    code: REQUEST_ABORTED,
    message: "Request aborted",
  });
