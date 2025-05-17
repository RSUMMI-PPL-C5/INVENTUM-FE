import { middleware, config } from "@/middleware";
import { NextRequest, NextResponse } from "next/server";

// Mock global fetch
global.fetch = jest.fn();

// Mock Buffer for JWT parsing
global.Buffer = {
  from: jest.fn().mockImplementation((str) => ({
    toString: jest.fn().mockReturnValue(JSON.stringify({ role: 'Admin' }))
  }))
} as any;

// Mock NextResponse with cookie delete functionality
const mockDeleteCookie = jest.fn();
jest.mock("next/server", () => ({
  NextResponse: {
    redirect: jest.fn().mockImplementation((url) => ({
      url,
      cookies: { delete: mockDeleteCookie }
    })),
    next: jest.fn(),
  },
}));

describe("Middleware Authentication", () => {
  let request: NextRequest;
  let loginPageRequest: NextRequest;
  let adminRouteRequest: NextRequest;

  beforeEach(() => {
    // Regular dashboard request
    request = {
      cookies: {
        get: jest.fn(),
      },
      url: "https://example.com/dashboard",
      nextUrl: { 
        pathname: "/dashboard", 
        origin: "https://example.com", 
        search: "", 
        href: "https://example.com/dashboard" 
      }
    } as unknown as NextRequest;

    // Login page request
    loginPageRequest = {
      cookies: {
        get: jest.fn(),
      },
      url: "https://example.com/",
      nextUrl: { 
        pathname: "/", 
        origin: "https://example.com", 
        search: "", 
        href: "https://example.com/" 
      }
    } as unknown as NextRequest;

    // Admin route request
    adminRouteRequest = {
      cookies: {
        get: jest.fn(),
      },
      url: "https://example.com/dashboard/user",
      nextUrl: { 
        pathname: "/dashboard/user", 
        origin: "https://example.com", 
        search: "", 
        href: "https://example.com/dashboard/user" 
      }
    } as unknown as NextRequest;
    
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
    
    jest.clearAllMocks();
  });

  // TESTS FOR MISSING OR INVALID TOKENS

  it("should allow access to login page without token", async () => {
    (loginPageRequest.cookies.get as jest.Mock).mockReturnValue(undefined);
    
    await middleware(loginPageRequest);
    
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(NextResponse.next).toHaveBeenCalled();
  });
  
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

  it("should redirect to '/' with error=token_expired if API response is not OK", async () => {
    (request.cookies.get as jest.Mock).mockReturnValue({ value: "invalid-token" });
    
    (fetch as jest.Mock).mockResolvedValue({ ok: false });
    
    await middleware(request);
    
    expect(fetch).toHaveBeenCalledWith("https://api.example.com/auth/check", {
      headers: { Authorization: "Bearer invalid-token" },
    });
    
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/?error=token_expired", request.url)
    );
    expect(mockDeleteCookie).toHaveBeenCalledWith("accessToken");
  });

  it("should redirect to '/' with error=server_error if fetch request throws an error", async () => {
    (request.cookies.get as jest.Mock).mockReturnValue({ value: "valid-token" });
    
    (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));
    
    await middleware(request);
    
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/?error=server_error", request.url)
    );
  });

  // TESTS FOR ROLE-BASED REDIRECTS

  it("should redirect Admin users to /dashboard/user when on login page", async () => {
    (loginPageRequest.cookies.get as jest.Mock).mockReturnValue({ value: "admin-token" });
    (fetch as jest.Mock).mockResolvedValue({ ok: true });
    (global.Buffer.from as jest.Mock).mockImplementation(() => ({
      toString: jest.fn().mockReturnValue(JSON.stringify({ role: 'Admin' }))
    }));
    
    await middleware(loginPageRequest);
    
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/dashboard/user", loginPageRequest.url)
    );
  });

  it("should redirect non-Admin users to /dashboard/medical-equipment when on login page", async () => {
    (loginPageRequest.cookies.get as jest.Mock).mockReturnValue({ value: "user-token" });
    (fetch as jest.Mock).mockResolvedValue({ ok: true });
    (global.Buffer.from as jest.Mock).mockImplementation(() => ({
      toString: jest.fn().mockReturnValue(JSON.stringify({ role: 'User' }))
    }));
    
    await middleware(loginPageRequest);
    
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/dashboard/medical-equipment", loginPageRequest.url)
    );
  });

  // TESTS FOR ROUTE PROTECTION

  it("should allow Admin users to access admin routes", async () => {
    (adminRouteRequest.cookies.get as jest.Mock).mockReturnValue({ value: "admin-token" });
    (fetch as jest.Mock).mockResolvedValue({ ok: true });
    (global.Buffer.from as jest.Mock).mockImplementation(() => ({
      toString: jest.fn().mockReturnValue(JSON.stringify({ role: 'Admin' }))
    }));
    
    await middleware(adminRouteRequest);
    
    expect(NextResponse.next).toHaveBeenCalled();
  });

  it("should redirect non-Admin users away from admin routes", async () => {
    (adminRouteRequest.cookies.get as jest.Mock).mockReturnValue({ value: "user-token" });
    (fetch as jest.Mock).mockResolvedValue({ ok: true });
    (global.Buffer.from as jest.Mock).mockImplementation(() => ({
      toString: jest.fn().mockReturnValue(JSON.stringify({ role: 'User' }))
    }));
    
    await middleware(adminRouteRequest);
    
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/dashboard/medical-equipment", adminRouteRequest.url)
    );
  });

  // TEST FOR TOKEN PARSING

  it("should correctly parse JWT token payload", async () => {
    const mockToken = "header.eyJyb2xlIjoiQWRtaW4ifQ.signature";
    (request.cookies.get as jest.Mock).mockReturnValue({ value: mockToken });
    (fetch as jest.Mock).mockResolvedValue({ ok: true });
    
    await middleware(request);
    
    expect(global.Buffer.from).toHaveBeenCalledWith("eyJyb2xlIjoiQWRtaW4ifQ", "base64");
  });

  // SUCCESSFUL AUTHENTICATION TEST
  
  it("should allow request to proceed if authentication is successful", async () => {
    (request.cookies.get as jest.Mock).mockReturnValue({ value: "valid-token" });
    (fetch as jest.Mock).mockResolvedValue({ ok: true });
    
    await middleware(request);
    
    expect(NextResponse.next).toHaveBeenCalled();
  });
});

describe("Middleware config", () => {
  it("should have the correct matcher", () => {
    expect(config).toEqual({
      matcher: ['/', '/dashboard/:path*'],
    });
  });
});