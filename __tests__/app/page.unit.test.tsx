import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginModule from "@/app/page";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

jest.mock("next/navigation", () => ({
    useRouter: jest.fn(() => ({
      push: jest.fn(),
    })),
    useSearchParams: jest.fn(() => ({
      get: jest.fn().mockReturnValue(null),
    })),
  }));
jest.mock("sonner", () => ({
    toast: { error: jest.fn(), warning: jest.fn()},
}));

describe("LoginModule - Unit Tests", () => {
	beforeEach(() => {
		global.fetch = jest.fn() as jest.Mock;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	// Positive Cases
	it("renders the login page correctly", () => {
		render(<LoginModule />);

		const logo = screen.getByAltText("Logo RS UMMI");
		expect(logo).toBeInTheDocument();

		const title = screen.getByText("INVENTUM");
		expect(title).toBeInTheDocument();

		const subtitle = screen.getByText("Inventaris Terpadu RS UMMI");
		expect(subtitle).toBeInTheDocument();

		const usernameInput = screen.getByPlaceholderText("azmy.arya.rizaldi");
		expect(usernameInput).toBeInTheDocument();

		const passwordInput = screen.getByPlaceholderText("******");
		expect(passwordInput).toBeInTheDocument();

		const loginButton = screen.getByRole("button", { name: /masuk/i });
		expect(loginButton).toBeInTheDocument();
	});

	it("toggles password visibility", () => {
		render(<LoginModule />);

		const passwordInput = screen.getByPlaceholderText("******");
		const toggleButton = screen.getByRole("button", {
			name: /show password/i,
		});

		expect(passwordInput).toHaveAttribute("type", "password");

		fireEvent.click(toggleButton);
		expect(passwordInput).toHaveAttribute("type", "text");

		fireEvent.click(toggleButton);
		expect(passwordInput).toHaveAttribute("type", "password");
	});

    test("does not show error toast on successful login", async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ token: "valid-token" }),
        });
    
        render(<LoginModule />);
    
        fireEvent.change(screen.getByPlaceholderText("azmy.arya.rizaldi"), {
          target: { value: "correctuser" },
        });
        fireEvent.change(screen.getByPlaceholderText("******"), {
          target: { value: "correctpassword" },
        });
        fireEvent.click(screen.getByText("Masuk"));
    
        await waitFor(() => {
          expect(toast.error).not.toHaveBeenCalled();
        });
    });

    it("should show a warning toast when error is 'unauthorized'", async () => {
        (useSearchParams as jest.Mock).mockReturnValue({
          get: jest.fn(() => "unauthorized"),
        });
    
        render(<LoginModule />);
    
        await waitFor(() => {
          expect(toast.warning).toHaveBeenCalledWith("You need to login first");
        });
      });
    
      it("should show an error toast when error is 'server_error'", async () => {
        (useSearchParams as jest.Mock).mockReturnValue({
          get: jest.fn(() => "server_error"),
        });
    
        render(<LoginModule />);
    
        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith("Something went wrong. Please try again.");
        });
      });

	// Negative Cases
	it("displays error messages if username is empty", async () => {
		render(<LoginModule />);

		const loginButton = screen.getByRole("button", { name: /masuk/i });
		fireEvent.click(loginButton);

		const usernameError = await screen.findByText("Username is required");
		expect(usernameError).toBeInTheDocument();
	});

	it("displays error messages if password is empty", async () => {
		render(<LoginModule />);

		const loginButton = screen.getByRole("button", { name: /masuk/i });
		fireEvent.click(loginButton);

		const passwordError = await screen.findByText("Password is required");
		expect(passwordError).toBeInTheDocument();
	});

	it("displays error messages if both username and password are empty", async () => {
		render(<LoginModule />);

		const loginButton = screen.getByRole("button", { name: /masuk/i });
		fireEvent.click(loginButton);

		const usernameError = await screen.findByText("Username is required");
		const passwordError = await screen.findByText("Password is required");

		expect(usernameError).toBeInTheDocument();
		expect(passwordError).toBeInTheDocument();
	});

	it("does not submit the form if username is empty", async () => {
		render(<LoginModule />);

		const passwordInput = screen.getByPlaceholderText("******");
		const loginButton = screen.getByRole("button", { name: /masuk/i });

		fireEvent.change(passwordInput, { target: { value: "testpassword" } });
		fireEvent.click(loginButton);

		const usernameError = await screen.findByText("Username is required");
		expect(usernameError).toBeInTheDocument();

		await waitFor(() => {
			expect(
				screen.queryByText("Password is required")
			).not.toBeInTheDocument();
		});
	});

	it("does not submit the form if password is empty", async () => {
		render(<LoginModule />);

		const usernameInput = screen.getByPlaceholderText("azmy.arya.rizaldi");
		const loginButton = screen.getByRole("button", { name: /masuk/i });

		fireEvent.change(usernameInput, { target: { value: "testuser" } });
		fireEvent.click(loginButton);

		const passwordError = await screen.findByText("Password is required");
		expect(passwordError).toBeInTheDocument();

		await waitFor(() => {
			expect(
				screen.queryByText("Username is required")
			).not.toBeInTheDocument();
		});
	});

	it("disables login button while loading", async () => {
		(global.fetch as jest.Mock).mockImplementationOnce(
			() =>
				new Promise((resolve) =>
					setTimeout(
						() =>
							resolve({
								ok: true,
								json: () =>
									Promise.resolve({ token: "mock-token" }),
							}),
						1000
					)
				)
		);

		render(<LoginModule />);

		const usernameInput = screen.getByPlaceholderText("azmy.arya.rizaldi");
		const passwordInput = screen.getByPlaceholderText("******");
		const loginButton = screen.getByRole("button", { name: /masuk/i });

		fireEvent.change(usernameInput, { target: { value: "kev23" } });
		fireEvent.change(passwordInput, { target: { value: "password123" } });

		fireEvent.click(loginButton);

		await waitFor(() => expect(loginButton).toBeDisabled());
	});

    test("shows error toast when thrown error", async () => {
        (fetch as jest.Mock).mockRejectedValueOnce("Unexpected error");
      
        render(<LoginModule />);
      
        fireEvent.change(screen.getByPlaceholderText("azmy.arya.rizaldi"), {
          target: { value: "user" },
        });
        fireEvent.change(screen.getByPlaceholderText("******"), {
          target: { value: "password" },
        });
        fireEvent.click(screen.getByText("Masuk"));
      
        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith("An error occurred during login");
        });
    });
    
    it("should not trigger a toast when error is null", async () => {
        (useSearchParams as jest.Mock).mockReturnValue({
          get: jest.fn(() => null),
        });
    
        render(<LoginModule />);
    
        await waitFor(() => {
          expect(toast.warning).not.toHaveBeenCalled();
          expect(toast.error).not.toHaveBeenCalled();
        });
      });
});
