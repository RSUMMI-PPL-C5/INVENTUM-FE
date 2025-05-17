import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginModule from "@/app/page";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn().mockReturnValue(null),
  })),
}));

jest.mock("js-cookie", () => ({
  set: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

describe("LoginModule - Integration Tests", () => {
  const mockPush = jest.fn();
  const mockGet = jest.fn().mockReturnValue(null);

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useSearchParams as jest.Mock).mockReturnValue({
      get: mockGet,
    });
    (Cookies.set as jest.Mock).mockClear();
    (toast.error as jest.Mock).mockClear();
    (toast.warning as jest.Mock).mockClear();

    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Form Validation Tests
  it("shows validation errors for empty fields", async () => {
    render(<LoginModule />);
    
    const loginButton = screen.getByRole("button", { name: /masuk/i });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText("Username is required")).toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
    });
    
    expect(global.fetch).not.toHaveBeenCalled();
  });

  // Password visibility toggle
  it("toggles password visibility", () => {
    render(<LoginModule />);
    
    const passwordInput = screen.getByPlaceholderText("******");
    expect(passwordInput).toHaveAttribute("type", "password");
    
    const toggleButton = screen.getByRole("button", { 
      name: /show password/i 
    });
    fireEvent.click(toggleButton);
    
    expect(passwordInput).toHaveAttribute("type", "text");
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  // Loading State Test
  it("shows loading state during form submission", async () => {
	// Make fetch take some time
	(global.fetch as jest.Mock).mockImplementationOnce(() => 
		new Promise(resolve => 
		setTimeout(() => 
			resolve({
			ok: true,
			json: () => Promise.resolve({ 
				data: { 
				user: { 
					token: "mock-token",
					role: "User"
				} 
				} 
			}),
			}), 100)
		)
	);
	
	render(<LoginModule />);
	
	const usernameInput = screen.getByPlaceholderText("azmy.arya.rizaldi");
	const passwordInput = screen.getByPlaceholderText("******");
	
	fireEvent.change(usernameInput, { target: { value: "testuser" } });
	fireEvent.change(passwordInput, { target: { value: "password123" } });
	
	const loginButton = screen.getByRole("button", { name: /masuk/i });
	fireEvent.click(loginButton);
	
	// Wait for loading state to appear
	await waitFor(() => {
		expect(loginButton).toBeDisabled();
	}, { timeout: 50 });
	
	// Wait for loading state to disappear
	await waitFor(() => {
		expect(loginButton).not.toHaveAttribute("data-state", "loading");
	}, { timeout: 200 });
	});

  // Role-Based Redirect Tests
  it("redirects Admin users to /dashboard/user", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          data: { 
            user: { 
              token: "admin-token",
              role: "Admin"
            } 
          } 
        }),
      })
    );

    render(<LoginModule />);

    const usernameInput = screen.getByPlaceholderText("azmy.arya.rizaldi");
    const passwordInput = screen.getByPlaceholderText("******");
    const loginButton = screen.getByRole("button", { name: /masuk/i });

    fireEvent.change(usernameInput, { target: { value: "admin" } });
    fireEvent.change(passwordInput, { target: { value: "adminpass" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(Cookies.set).toHaveBeenCalledWith(
        "accessToken",
        "admin-token",
        { expires: 7 }
      );
      expect(mockPush).toHaveBeenCalledWith("/dashboard/user");
    });
  });

  it("redirects User role to /dashboard/medical-equipment", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          data: { 
            user: { 
              token: "user-token",
              role: "User"
            } 
          } 
        }),
      })
    );

    render(<LoginModule />);

    const usernameInput = screen.getByPlaceholderText("azmy.arya.rizaldi");
    const passwordInput = screen.getByPlaceholderText("******");
    const loginButton = screen.getByRole("button", { name: /masuk/i });

    fireEvent.change(usernameInput, { target: { value: "regularuser" } });
    fireEvent.change(passwordInput, { target: { value: "userpass" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(Cookies.set).toHaveBeenCalledWith(
        "accessToken",
        "user-token",
        { expires: 7 }
      );
      expect(mockPush).toHaveBeenCalledWith("/dashboard/medical-equipment");
    });
  });

  it("redirects Fasum role to /dashboard/medical-equipment", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          data: { 
            user: { 
              token: "fasum-token",
              role: "Fasum"
            } 
          } 
        }),
      })
    );

    render(<LoginModule />);

    const usernameInput = screen.getByPlaceholderText("azmy.arya.rizaldi");
    const passwordInput = screen.getByPlaceholderText("******");
    const loginButton = screen.getByRole("button", { name: /masuk/i });

    fireEvent.change(usernameInput, { target: { value: "fasum" } });
    fireEvent.change(passwordInput, { target: { value: "fasumpass" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(Cookies.set).toHaveBeenCalledWith(
        "accessToken",
        "fasum-token",
        { expires: 7 }
      );
      expect(mockPush).toHaveBeenCalledWith("/dashboard/medical-equipment");
    });
  });

  it("redirects unknown roles to /dashboard as fallback", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          data: { 
            user: { 
              token: "unknown-token",
              role: "Unknown"
            } 
          } 
        }),
      })
    );

    render(<LoginModule />);

    const usernameInput = screen.getByPlaceholderText("azmy.arya.rizaldi");
    const passwordInput = screen.getByPlaceholderText("******");
    const loginButton = screen.getByRole("button", { name: /masuk/i });

    fireEvent.change(usernameInput, { target: { value: "unknown" } });
    fireEvent.change(passwordInput, { target: { value: "unknownpass" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(Cookies.set).toHaveBeenCalledWith(
        "accessToken",
        "unknown-token",
        { expires: 7 }
      );
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  // Error Handling Tests
  it("displays error message on network failure", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error("Network error"))
    );

    render(<LoginModule />);

    const usernameInput = screen.getByPlaceholderText("azmy.arya.rizaldi");
    const passwordInput = screen.getByPlaceholderText("******");
    const loginButton = screen.getByRole("button", { name: /masuk/i });

    fireEvent.change(usernameInput, { target: { value: "someuser" } });
    fireEvent.change(passwordInput, { target: { value: "somepass" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Network error");
    });
  });

  // URL Parameter Error Tests
  it("shows unauthorized warning for error=unauthorized", async () => {
    mockGet.mockImplementation((param) => {
      if (param === "error") return "unauthorized";
      return null;
    });
    
    render(<LoginModule />);
    
    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalledWith("You need to login first");
    });
  });

  it("shows server error message for error=server_error", async () => {
    mockGet.mockImplementation((param) => {
      if (param === "error") return "server_error";
      return null;
    });
    
    render(<LoginModule />);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong. Please try again.");
    });
  });

  it("displays API error message when login fails", async () => {
	const errorMessage = "Invalid username or password";
	
	(global.fetch as jest.Mock).mockImplementationOnce(() =>
		Promise.resolve({
		ok: false,
		json: () => Promise.resolve({ 
			message: errorMessage 
		}),
		})
	);

	render(<LoginModule />);

	const usernameInput = screen.getByPlaceholderText("azmy.arya.rizaldi");
	const passwordInput = screen.getByPlaceholderText("******");
	const loginButton = screen.getByRole("button", { name: /masuk/i });

	fireEvent.change(usernameInput, { target: { value: "invalid" } });
	fireEvent.change(passwordInput, { target: { value: "wrongpass" } });
	fireEvent.click(loginButton);

	await waitFor(() => {
		expect(toast.error).toHaveBeenCalledWith(errorMessage);
	});
  });

  it("displays fallback error message when API error has no message", async () => {
	(global.fetch as jest.Mock).mockImplementationOnce(() =>
		Promise.resolve({
		ok: false,
		json: () => Promise.resolve({ 
			// No message property in the response
		}),
		})
	);

	render(<LoginModule />);

	const usernameInput = screen.getByPlaceholderText("azmy.arya.rizaldi");
	const passwordInput = screen.getByPlaceholderText("******");
	const loginButton = screen.getByRole("button", { name: /masuk/i });

	fireEvent.change(usernameInput, { target: { value: "invalid" } });
	fireEvent.change(passwordInput, { target: { value: "wrongpass" } });
	fireEvent.click(loginButton);

	await waitFor(() => {
		expect(toast.error).toHaveBeenCalledWith("An error occurred during login");
	});
  });
});