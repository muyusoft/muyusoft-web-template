import { describe, expect, it } from "vitest";
import {
  ApiError,
  codeForStatus,
  fromHttpResponse,
  networkError,
} from "@/config/api-error";

describe("fromHttpResponse", () => {
  it("keeps the backend code, message and details of a JSON error", () => {
    const error = fromHttpResponse(
      400,
      JSON.stringify({
        error_code: "INVALID_CEDULA_CHECKSUM",
        message: "Cédula inválida",
        details: { field: "id_card" },
      }),
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 400,
      code: "INVALID_CEDULA_CHECKSUM",
      message: "Cédula inválida",
      details: { field: "id_card" },
    });
  });

  it("uses a plain-text body as the message and derives the code from the status", () => {
    const error = fromHttpResponse(400, "invalid Ecuadorian mobile phone\n");

    expect(error).toMatchObject({
      status: 400,
      code: "HTTP_400",
      message: "invalid Ecuadorian mobile phone",
    });
  });

  it("derives the code when a JSON error has no error_code", () => {
    expect(
      fromHttpResponse(429, JSON.stringify({ message: "slow down" })),
    ).toMatchObject({
      code: "RATE_LIMIT_EXCEEDED",
      message: "slow down",
    });
  });

  it("falls back to the status when the body is empty", () => {
    expect(fromHttpResponse(503, "")).toMatchObject({
      code: "SERVER_ERROR",
      message: "HTTP 503",
    });
  });

  it("accepts an already parsed body", () => {
    expect(
      fromHttpResponse(404, { error_code: "RESOURCE_NOT_FOUND", message: "x" })
        .code,
    ).toBe("RESOURCE_NOT_FOUND");
  });
});

describe("codeForStatus", () => {
  it.each([
    [401, "UNAUTHORIZED"],
    [403, "FORBIDDEN"],
    [429, "RATE_LIMIT_EXCEEDED"],
    [500, "SERVER_ERROR"],
    [504, "SERVER_ERROR"],
    [409, "HTTP_409"],
  ])("maps %i to %s", (status, code) => {
    expect(codeForStatus(status)).toBe(code);
  });
});

describe("networkError", () => {
  it("has status 0 and the NETWORK_ERROR code", () => {
    expect(networkError("timeout of 15000ms exceeded")).toMatchObject({
      status: 0,
      code: "NETWORK_ERROR",
      message: "timeout of 15000ms exceeded",
    });
  });
});
