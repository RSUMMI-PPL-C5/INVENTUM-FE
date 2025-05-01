import { middleware, config } from "@/middleware";
import { NextRequest, NextResponse } from "next/server";

global.fetch = jest.fn();

jest.mock("next/server", () => ({
  NextResponse: {
    redirect: jest.fn(),
    next: jest.fn(),
  },
}));

describe("Middleware Authentication", () => {
  let request: NextRequest;

  beforeEach(() => {
    request = {
      cookies: {
        get: jest.fn(),
      },
      url: "https://example.com/dashboard",
    } as unknown as NextRequest;

    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Positive Cases
  it("should allow request to proceed if authentication is successful", async () => {
    (request.cookies.get as jest.Mock).mockReturnValue({ value: "valid-token" });

    (fetch as jest.Mock).mockResolvedValue({ ok: true });

    await middleware(request);

    expect(fetch).toHaveBeenCalledWith("https://api.example.com/auth/check", {
      headers: { Authorization: "Bearer valid-token" },
    });

    expect(NextResponse.next).toHaveBeenCalled();
  });

  // Negative Cases
  it("should redirect to '/' with error=unauthorized if token is missing", async () => {
    (request.cookies.get as jest.Mock).mockReturnValue(undefined);

    await middleware(request);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/?error=unauthorized", request.url)
    );
  });

  it("should redirect to '/' with error=server_error if NEXT_PUBLIC_API_URL is missing", async () => {
    process.env.NEXT_PUBLIC_API_URL = "";

    (request.cookies.get as jest.Mock).mockReturnValue({ value: "valid-token" });

    await middleware(request);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/?error=server_error", request.url)
    );
  });

  it("should redirect to '/' with error=unauthorized if API response is not OK", async () => {
    (request.cookies.get as jest.Mock).mockReturnValue({ value: "invalid-token" });

    (fetch as jest.Mock).mockResolvedValue({ ok: false });

    await middleware(request);

    expect(fetch).toHaveBeenCalledWith("https://api.example.com/auth/check", {
      headers: { Authorization: "Bearer invalid-token" },
    });

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/?error=unauthorized", request.url)
    );
  });

  it("should redirect to '/' with error=server_error if fetch request throws an error", async () => {
    (request.cookies.get as jest.Mock).mockReturnValue({ value: "valid-token" });

    (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    await middleware(request);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/?error=server_error", request.url)
    );
  });
});

describe("Middleware config", () => {
  it("should have the correct matcher", () => {
    expect(config).toEqual({
      matcher: ["/dashboard/:path*"],
    });
  });
});