import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginModule from "@/app/page";
import { useRouter } from "next/navigation";
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
	},
}));

describe("LoginModule - Integration Tests", () => {
	const mockPush = jest.fn();

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({
			push: mockPush,
		});
		(Cookies.set as jest.Mock).mockClear();
		(toast.error as jest.Mock).mockClear();

		global.fetch = jest.fn() as jest.Mock;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	// Positive Cases
	it("submits the form and navigates to the dashboard on successful login", async () => {
		(global.fetch as jest.Mock).mockImplementationOnce(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve({ token: "mock-token" }),
			})
		);

		render(<LoginModule />);

		const usernameInput = screen.getByPlaceholderText("azmy.arya.rizaldi");
		const passwordInput = screen.getByPlaceholderText("******");
		const loginButton = screen.getByRole("button", { name: /masuk/i });

		fireEvent.change(usernameInput, { target: { value: "correctuser" } });
		fireEvent.change(passwordInput, {
			target: { value: "correctpassword" },
		});

		fireEvent.click(loginButton);

		await waitFor(() => {
			expect(global.fetch).toHaveBeenCalledWith(
				`${process.env.NEXT_PUBLIC_API_URL}/auth`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						username: "correctuser",
						password: "correctpassword",
					}),
				}
			);
		});

		await waitFor(() => {
			expect(Cookies.set).toHaveBeenCalledWith(
				"accessToken",
				"mock-token",
				{
					expires: 7,
				}
			);
		});

		await waitFor(() => {
			expect(mockPush).toHaveBeenCalledWith(
				"/dashboard/medical-equipment"
			);
		});
	});

	// Negative Cases
	it("displays error message on failed login", async () => {
		(global.fetch as jest.Mock).mockImplementationOnce(() =>
			Promise.resolve({
				ok: false,
				json: () => Promise.resolve({ message: "Invalid credentials" }),
			})
		);

		render(<LoginModule />);

		const usernameInput = screen.getByPlaceholderText("azmy.arya.rizaldi");
		const passwordInput = screen.getByPlaceholderText("******");
		const loginButton = screen.getByRole("button", { name: /masuk/i });

		fireEvent.change(usernameInput, { target: { value: "wronguser" } });
		fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });

		fireEvent.click(loginButton);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
		});
	});

	it("displays generic error message on unclear API response", async () => {
		(global.fetch as jest.Mock).mockImplementationOnce(() =>
			Promise.resolve({
				ok: false,
				json: () => Promise.resolve({}),
			})
		);

		render(<LoginModule />);

		const usernameInput = screen.getByPlaceholderText("azmy.arya.rizaldi");
		const passwordInput = screen.getByPlaceholderText("******");
		const loginButton = screen.getByRole("button", { name: /masuk/i });

		fireEvent.change(usernameInput, { target: { value: "wronguser" } });
		fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });

		fireEvent.click(loginButton);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith(
				"An error occurred during login"
			);
		});
	});
});
