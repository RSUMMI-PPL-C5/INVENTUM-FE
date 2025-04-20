	import React from "react";
	import { render, screen, fireEvent, waitFor } from "@testing-library/react";
	import "@testing-library/jest-dom";
	import { useRouter } from "next/navigation";
	import DivisionPage from "@/app/dashboard/division/page";
	import DisplayDivisi from "@/modules/division/divisi-display";
	import Cookies from "js-cookie";

	// Mock next/navigation
	jest.mock("next/navigation", () => ({
		useRouter: jest.fn(),
		usePathname: jest.fn(),
	}));

	// Mock js-cookie
	jest.mock("js-cookie", () => ({
		get: jest.fn(),
	}));

	// Mock @/hooks/use-toast
	jest.mock("@/hooks/use-toast", () => ({
		useToast: jest.fn().mockReturnValue({
			toast: jest.fn(),
		}),
	}));

	// Mock fetch
	global.fetch = jest.fn();

	// Mock component to avoid testing implementation details of child components
	jest.mock("@/modules/division/divisi-display", () => {
		return jest.fn(() => (
			<div data-testid="display-divisi">DisplayDivisi Component</div>
		));
	});

	describe("DivisionPage", () => {
		it("renders the DisplayDivisi component", () => {
			render(<DivisionPage />);

			// Check that DisplayDivisi was rendered
			expect(screen.getByTestId("display-divisi")).toBeInTheDocument();

			// Verify the DisplayDivisi component was called
			expect(DisplayDivisi).toHaveBeenCalled();
		});
	});

	// Unmock DisplayDivisi for direct component tests
	jest.unmock("@/modules/division/divisi-display");

	// Now test the DisplayDivisi component directly
	describe("DisplayDivisi Component", () => {
		const mockPush = jest.fn();

		// Mock division data
		const mockDivisions = [
			{
				id: 1,
				divisi: "Operations",
				parentId: null,
				children: [],
			},
			{
				id: 2,
				divisi: "IT Department",
				parentId: null,
				children: [],
			},
		];

		// Mock division with children
		const mockDivisionWithChildren = {
			id: 1,
			divisi: "Operations",
			parentId: null,
			children: [
				{
					id: 3,
					divisi: "Software Development",
					parentId: 1,
					children: [],
				},
			],
		};

		beforeEach(() => {
			jest.clearAllMocks();

			// Setup router mock
			(useRouter as jest.Mock)
				.mockReturnValue({
					push: mockPush,
				})
				(
					// Default cookie mock
					Cookies.get as jest.Mock
				)
				.mockReturnValue("mock-token")
				(
					// Default fetch success for parent divisions
					global.fetch as jest.Mock
				)
				.mockResolvedValue({
					ok: true,
					json: jest.fn().mockResolvedValue(mockDivisions),
				});
		});

		// Positive Cases
		it("should render loading state initially", async () => {
			render(<DisplayDivisi />);

			// Check loading state
			expect(
				screen.getByTestId("loading-state") ||
					screen.getAllByRole("skeleton")[0]
			).toBeInTheDocument();

			// Wait for content to load
			await waitFor(() => {
				expect(
					screen.queryByTestId("loading-state") ||
						screen.queryAllByRole("skeleton")[0]
				).not.toBeInTheDocument();
			});
		});

		it("should fetch and display divisions on load", async () => {
			render(<DisplayDivisi />);

			// Wait for divisions to load
			await waitFor(() => {
				expect(screen.getByText("Operations")).toBeInTheDocument();
			});

			// Verify fetch was called correctly
			expect(global.fetch).toHaveBeenCalledWith(
				"http://localhost:8000/divisi",
				expect.objectContaining({
					method: "GET",
					headers: expect.objectContaining({
						Authorization: "Bearer mock-token",
					}),
				})
			);
		});

		it("should expand a division and fetch its children when clicked", async () => {
			// Mock fetch for children
			(global.fetch as jest.Mock).mockImplementation((url) => {
				if (url.includes("/divisi/1")) {
					return Promise.resolve({
						ok: true,
						json: jest.fn().mockResolvedValue(mockDivisionWithChildren),
					});
				}

				return Promise.resolve({
					ok: true,
					json: jest.fn().mockResolvedValue(mockDivisions),
				});
			});

			render(<DisplayDivisi />);

			// Wait for divisions to load
			await waitFor(() => {
				expect(screen.getByText("Operations")).toBeInTheDocument();
			});

			// Click to expand Operations division
			fireEvent.click(screen.getAllByRole("button")[2]); // First expand button (adjusting for real UI)

			// Should show loading state for children
			expect(
				await screen.findByText("Software Development")
			).toBeInTheDocument();
		});

		it("should navigate to add division page when add button is clicked", async () => {
			render(<DisplayDivisi />);

			// Wait for divisions to load
			await waitFor(() => {
				expect(
					screen.queryByTestId("loading-state") ||
						screen.queryAllByRole("skeleton")[0]
				).not.toBeInTheDocument();
			});

			// Click add division button
			fireEvent.click(screen.getByText("Tambah Divisi"));

			// Verify navigation
			expect(mockPush).toHaveBeenCalledWith("/dashboard/division/add");
		});

		it("should navigate to edit page when edit button is clicked", async () => {
			render(<DisplayDivisi />);

			// Wait for divisions to load
			await waitFor(() => {
				expect(screen.getByText("Operations")).toBeInTheDocument();
			});

			// Find edit buttons
			const editButtons = screen
				.getAllByRole("button")
				.filter(
					(btn) =>
						btn.innerHTML.includes("svg") &&
						!btn.innerHTML.includes("Loader")
				);

			// Click edit button for first division
			fireEvent.click(editButtons[0]);

			// Verify navigation
			expect(mockPush).toHaveBeenCalledWith("/dashboard/division/1/edit");
		});

		it("should open confirm dialog when delete button is clicked", async () => {
			render(<DisplayDivisi />);

			// Wait for divisions to load
			await waitFor(() => {
				expect(screen.getByText("Operations")).toBeInTheDocument();
			});

			// Find delete buttons
			const deleteButtons = screen
				.getAllByRole("button")
				.filter(
					(btn) =>
						btn.innerHTML.includes("svg") &&
						!btn.innerHTML.includes("Loader")
				);

			// Click delete button for first division
			fireEvent.click(deleteButtons[1]); // Second button should be delete

			// Verify dialog is shown
			expect(screen.getByRole("alertdialog")).toBeInTheDocument();
			expect(
				screen.getByText(/Are you sure you want to delete/)
			).toBeInTheDocument();
		});

		it("should delete division when confirmed", async () => {
			// Mock successful delete
			(global.fetch as jest.Mock).mockImplementation((url, options) => {
				if (options && options.method === "DELETE") {
					return Promise.resolve({ ok: true });
				}

				return Promise.resolve({
					ok: true,
					json: jest.fn().mockResolvedValue(mockDivisions),
				});
			});

			render(<DisplayDivisi />);

			// Wait for divisions to load
			await waitFor(() => {
				expect(screen.getByText("Operations")).toBeInTheDocument();
			});

			// Find delete buttons
			const deleteButtons = screen
				.getAllByRole("button")
				.filter(
					(btn) =>
						btn.innerHTML.includes("svg") &&
						!btn.innerHTML.includes("Loader")
				);

			// Click delete button for first division
			fireEvent.click(deleteButtons[1]); // Second button should be delete

			// Click confirm in the dialog
			fireEvent.click(screen.getByText("Delete"));

			// Verify delete was called
			await waitFor(() => {
				expect(global.fetch).toHaveBeenCalledWith(
					"http://localhost:8000/divisi/1",
					expect.objectContaining({
						method: "DELETE",
					})
				);
			});
		});

		// Negative Cases
		it("should handle API error when fetching divisions", async () => {
			// Mock API error
			(global.fetch as jest.Mock).mockRejectedValueOnce(
				new Error("Failed to fetch")
			);

			render(<DisplayDivisi />);

			// Wait for error to be displayed
			await waitFor(() => {
				expect(
					screen.getByText(/Failed to load divisions/i)
				).toBeInTheDocument();
			});

			// Verify console.error was called
			expect(console.error).toHaveBeenCalled();
		});

		it("should handle non-ok response when fetching divisions", async () => {
			// Mock non-ok response
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: false,
				status: 500,
			});

			render(<DisplayDivisi />);

			// Wait for error to be displayed
			await waitFor(() => {
				expect(
					screen.getByText(/Failed to load divisions/i)
				).toBeInTheDocument();
			});
		});

		it("should handle API error when fetching division children", async () => {
			// Mock fetch for API error on children
			(global.fetch as jest.Mock).mockImplementation((url) => {
				if (url.includes("/divisi/1")) {
					return Promise.reject(new Error("Failed to fetch children"));
				}

				return Promise.resolve({
					ok: true,
					json: jest.fn().mockResolvedValue(mockDivisions),
				});
			});

			render(<DisplayDivisi />);

			// Wait for divisions to load
			await waitFor(() => {
				expect(screen.getByText("Operations")).toBeInTheDocument();
			});

			// Click to expand Operations division
			fireEvent.click(screen.getAllByRole("button")[2]); // First expand button

			// Verify error handling
			await waitFor(() => {
				expect(console.error).toHaveBeenCalled();
			});
		});

		it("should handle non-ok response when fetching division children", async () => {
			// Mock fetch for non-ok response on children
			(global.fetch as jest.Mock).mockImplementation((url) => {
				if (url.includes("/divisi/1")) {
					return Promise.resolve({
						ok: false,
						status: 500,
					});
				}

				return Promise.resolve({
					ok: true,
					json: jest.fn().mockResolvedValue(mockDivisions),
				});
			});

			render(<DisplayDivisi />);

			// Wait for divisions to load
			await waitFor(() => {
				expect(screen.getByText("Operations")).toBeInTheDocument();
			});

			// Click to expand Operations division
			fireEvent.click(screen.getAllByRole("button")[2]); // First expand button

			// Verify error handling
			await waitFor(() => {
				expect(console.error).toHaveBeenCalled();
			});
		});

		it("should handle API error when deleting division", async () => {
			// Mock failed delete
			(global.fetch as jest.Mock).mockImplementation((url, options) => {
				if (options && options.method === "DELETE") {
					return Promise.resolve({ ok: false });
				}

				return Promise.resolve({
					ok: true,
					json: jest.fn().mockResolvedValue(mockDivisions),
				});
			});

			render(<DisplayDivisi />);

			// Wait for divisions to load
			await waitFor(() => {
				expect(screen.getByText("Operations")).toBeInTheDocument();
			});

			// Find delete buttons
			const deleteButtons = screen
				.getAllByRole("button")
				.filter(
					(btn) =>
						btn.innerHTML.includes("svg") &&
						!btn.innerHTML.includes("Loader")
				);

			// Click delete button for first division
			fireEvent.click(deleteButtons[1]); // Second button should be delete

			// Click confirm in the dialog
			fireEvent.click(screen.getByText("Delete"));

			// Verify error handling
			await waitFor(() => {
				expect(
					screen.getByText(/Failed to delete division/i)
				).toBeInTheDocument();
			});
		});

		it("should not delete when cancel is clicked in confirmation dialog", async () => {
			render(<DisplayDivisi />);

			// Wait for divisions to load
			await waitFor(() => {
				expect(screen.getByText("Operations")).toBeInTheDocument();
			});

			// Find delete buttons
			const deleteButtons = screen
				.getAllByRole("button")
				.filter(
					(btn) =>
						btn.innerHTML.includes("svg") &&
						!btn.innerHTML.includes("Loader")
				);

			// Click delete button for first division
			fireEvent.click(deleteButtons[1]); // Second button should be delete

			// Click cancel in the dialog
			fireEvent.click(screen.getByText("Cancel"));

			// Verify delete was not called
			expect(global.fetch).not.toHaveBeenCalledWith(
				expect.stringMatching(/delete/i),
				expect.objectContaining({ method: "DELETE" })
			);
		});

		it("should handle empty divisions array", async () => {
			// Mock empty division array
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: jest.fn().mockResolvedValue([]),
			});

			render(<DisplayDivisi />);

			// Wait for data to load
			await waitFor(() => {
				expect(
					screen.queryByTestId("loading-state") ||
						screen.queryAllByRole("skeleton")[0]
				).not.toBeInTheDocument();
			});

			// Check for empty state message
			expect(screen.getByText("No divisions found")).toBeInTheDocument();
		});

		it("should not fetch children again if already loaded", async () => {
			// Set up fetch to track calls
			const mockFetch = jest.fn().mockImplementation((url) => {
				if (url.includes("/divisi/1")) {
					return Promise.resolve({
						ok: true,
						json: jest.fn().mockResolvedValue(mockDivisionWithChildren),
					});
				}

				return Promise.resolve({
					ok: true,
					json: jest.fn().mockResolvedValue(mockDivisions),
				});
			});

			global.fetch = mockFetch;

			render(<DisplayDivisi />);

			// Wait for divisions to load
			await waitFor(() => {
				expect(screen.getByText("Operations")).toBeInTheDocument();
			});

			// Click to expand Operations division
			fireEvent.click(screen.getAllByRole("button")[2]); // First expand button

			// Wait for children to load
			await waitFor(() => {
				expect(
					screen.getByText("Software Development")
				).toBeInTheDocument();
			});

			// Reset mock to track new calls
			mockFetch.mockClear();

			// Click to collapse and re-expand
			fireEvent.click(screen.getAllByRole("button")[2]); // Collapse
			fireEvent.click(screen.getAllByRole("button")[2]); // Expand again

			// Verify children data wasn't fetched again
			expect(mockFetch).not.toHaveBeenCalledWith(
				"http://localhost:8000/divisi/1",
				expect.anything()
			);
		});
	});
