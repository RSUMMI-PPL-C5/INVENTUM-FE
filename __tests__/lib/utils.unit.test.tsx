import { decodeToken } from "@/lib/utils";

describe("decodeToken", () => {
  test("decodes a valid token", () => {
    const validToken = "header." + 
      btoa(JSON.stringify({ sub: "123", name: "Test User" })) + 
      ".signature";

    const result = decodeToken(validToken);

    expect(result).toEqual({ sub: "123", name: "Test User" });
  });

  test("returns null for a token with invalid format", () => {
    const invalidToken = "invalid-token";

    const result = decodeToken(invalidToken);

    expect(result).toBeNull();
  });

  test("returns null for an empty token", () => {
    const result = decodeToken("");

    expect(result).toBeNull();
  });

  test("returns null for a token with invalid base64 payload", () => {
    const invalidBase64Token = "header.invalid_base64.signature";

    const result = decodeToken(invalidBase64Token);

    expect(result).toBeNull();
  });

  test("logs an error for invalid token format", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const invalidToken = "invalid-token";

    decodeToken(invalidToken);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error decoding token:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});