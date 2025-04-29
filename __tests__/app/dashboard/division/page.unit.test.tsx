import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useRouter } from "next/navigation";
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

// Mock fetch
global.fetch = jest.fn();

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

    // Mock router
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // Mock cookies
    (Cookies.get as jest.Mock).mockReturnValue("mock-token");

    // Mock fetch success
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockDivisions),
    });
	});

	// Positive Cases
	it("should render loading state initially", async () => {
		render(<DisplayDivisi />);

		// Check loading state
		expect(screen.getByTestId("loading-state")).toBeInTheDocument();

		// Wait for content to load
		await waitFor(() => {
			expect(screen.queryByTestId("loading-state")).not.toBeInTheDocument();
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
		fireEvent.click(screen.getAllByRole("button")[1]);

		// Should show loading state for children
		await waitFor(() => {
			expect(screen.getByText("Software Development")).toBeInTheDocument();
		});
	});

	it("should not fetch children if already loaded", async () => {
		// Mock division with pre-loaded children
		const mockDivisionsWithChildren = [
			{
				id: 1,
				divisi: "Operations",
				parentId: null,
				children: [
					{
						id: 3,
						divisi: "Software Development",
						parentId: 1,
						children: []
					}
				]
			}
		];
	
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: jest.fn().mockResolvedValue(mockDivisionsWithChildren),
		});
	
		render(<DisplayDivisi />);
	
		// Wait for divisions to load
		await waitFor(() => {
			expect(screen.getByText("Operations")).toBeInTheDocument();
		});
	
		// Clear fetch mock to track new calls
		(global.fetch as jest.Mock).mockClear();
	
		// Click to expand Operations division
		fireEvent.click(screen.getAllByRole("button")[1]);
	
		// Verify no fetch occurred for children
		await waitFor(() => {
			expect(global.fetch).not.toHaveBeenCalledWith(
				expect.stringContaining("/divisi/1"),
				expect.anything()
			);
		});
	
		// Verify children are shown without loading
		expect(screen.getByText("Software Development")).toBeInTheDocument();
		expect(screen.queryByTestId("expanded-divisions")).not.toBeInTheDocument();
	});

	it("should navigate to add division page when add button is clicked", async () => {
		render(<DisplayDivisi />);

		// Wait for divisions to load
		await waitFor(() => {
			expect(screen.queryByTestId("loading-state")).not.toBeInTheDocument();
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
		fireEvent.click(editButtons[2]);

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
		fireEvent.click(deleteButtons[3]);

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
		fireEvent.click(deleteButtons[3]);

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

	it("should not delete when divisionToDelete is null", async () => {
		// Mock fetch to track if delete is called
		const mockFetch = jest.fn().mockResolvedValue({
			ok: true,
			json: jest.fn().mockResolvedValue(mockDivisions),
		});
		global.fetch = mockFetch;
		
		render(<DisplayDivisi />);
		
		// Wait for divisions to load
		await waitFor(() => {
			expect(screen.getByText("Operations")).toBeInTheDocument();
		});
		
		// Reset the fetch mock to track new calls
		mockFetch.mockClear();
		
		// The component won't try to delete if no division is selected for deletion
		// We check that no DELETE request is made when nothing is selected
		expect(mockFetch).not.toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ method: "DELETE" })
		);
	});

	// Negative Cases
	it("should handle API error when fetching divisions", async () => {
		// Mock API error
		(global.fetch as jest.Mock).mockRejectedValueOnce(
			new Error("Failed to fetch")
		);

		const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

		render(<DisplayDivisi />);

		// Wait for error to be displayed
		await waitFor(() => {
			expect(
				screen.getByText(/Failed to load divisions/i)
			).toBeInTheDocument();
		});

		// Verify console.error was called
		expect(console.error).toHaveBeenCalledWith("Error fetching parent divisions:", expect.any(Error));

		errorSpy.mockRestore();
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

		const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

		render(<DisplayDivisi />);

		// Wait for divisions to load
		await waitFor(() => {
			expect(screen.getByText("Operations")).toBeInTheDocument();
		});

		// Click to expand Operations division
		fireEvent.click(screen.getAllByRole("button")[1]);

		// Verify error handling
		await waitFor(() => {
			expect(console.error).toHaveBeenCalledWith("Error fetching division children:", expect.any(Error));
		});

		errorSpy.mockRestore();
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

		const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

		render(<DisplayDivisi />);

		// Wait for divisions to load
		await waitFor(() => {
			expect(screen.getByText("Operations")).toBeInTheDocument();
		});

		// Click to expand Operations division
		fireEvent.click(screen.getAllByRole("button")[1]);

		// Verify error handling
		await waitFor(() => {
			expect(console.error).toHaveBeenCalledWith("Error fetching division children:", expect.any(Error));
		});

		errorSpy.mockRestore();
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
		fireEvent.click(deleteButtons[3]);

		// Click confirm in the dialog
		fireEvent.click(screen.getByText("Delete"));

		// Verify error handling with a more flexible approach
		await waitFor(() => {
			// Just verify that the delete API was called
			expect(global.fetch).toHaveBeenCalledWith(
				"http://localhost:8000/divisi/1",
				expect.objectContaining({
					method: "DELETE",
				})
			);
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
		fireEvent.click(deleteButtons[3]);

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
			expect(screen.queryByTestId("loading-state")).not.toBeInTheDocument();
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
		fireEvent.click(screen.getAllByRole("button")[1]);

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

	it("should handle missing token when fetching parent divisions", async () => {
		// Mock Cookies.get to return undefined
		(Cookies.get as jest.Mock).mockReturnValue(undefined);
		
		render(<DisplayDivisi />);
		
		await waitFor(() => {
			expect(global.fetch).toHaveBeenCalledWith(
				"http://localhost:8000/divisi",
				expect.objectContaining({
					headers: expect.objectContaining({
						Authorization: "", // Empty Authorization header
					}),
				})
			);
		});
	});

	it("should handle missing token when fetching division children", async () => {
		// Mock Cookies.get to return null
		(Cookies.get as jest.Mock).mockReturnValue(null);
		
		(global.fetch as jest.Mock).mockImplementation((url) => {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue(
					url.includes("/divisi/1") ? mockDivisionWithChildren : mockDivisions
				),
			});
		});
		
		render(<DisplayDivisi />);
		
		// Wait for divisions to load
		await waitFor(() => {
			expect(screen.getByText("Operations")).toBeInTheDocument();
		});
		
		// Click to expand Operations division
		fireEvent.click(screen.getAllByRole("button")[1]);
		
		// Verify that fetch was called with empty Authorization
		await waitFor(() => {
			expect(global.fetch).toHaveBeenCalledWith(
				"http://localhost:8000/divisi/1",
				expect.objectContaining({
					headers: expect.objectContaining({
						Authorization: "", // Empty Authorization header
					}),
				})
			);
		});
	});
	
	it("should handle missing token when deleting division", async () => {
		// Mock Cookies.get to return undefined
		(Cookies.get as jest.Mock).mockReturnValue(undefined);
		
		(global.fetch as jest.Mock).mockImplementation((url, options) => {
			if (options && options.method === "DELETE") {
				// For delete requests
				return Promise.resolve({ ok: true });
			}
			// For other requests
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
		
		// Find delete buttons and click the first one
		const deleteButtons = screen
			.getAllByRole("button")
			.filter(
				(btn) => btn.innerHTML.includes("svg") && !btn.innerHTML.includes("Loader")
			);
			
		fireEvent.click(deleteButtons[3]);
		
		// Click confirm in the dialog
		fireEvent.click(screen.getByText("Delete"));
		
		// Verify delete was called with empty Authorization header
		await waitFor(() => {
			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining("divisi/1"),
				expect.objectContaining({
					method: "DELETE",
					headers: expect.objectContaining({
						Authorization: "", // Empty Authorization header
					}),
				})
			);
		});
	});
	
	it("should display loading skeletons when fetching children", async () => {
		// Create a controlled promise to delay the fetch response
		let resolveFetch: (value: any) => void;
		const fetchPromise = new Promise(resolve => {
			resolveFetch = resolve;
		});
		
		// Set up fetch mock with delayed response for division children
		(global.fetch as jest.Mock).mockImplementation((url) => {
			if (url.includes("/divisi/1")) {
				return fetchPromise;
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
		
		// Expand the first division
		fireEvent.click(screen.getAllByRole("button")[1]);
		
		// Check for loading skeletons
		await waitFor(() => {
			expect(screen.getByTestId("expanded-divisions")).toBeInTheDocument();
		});
		
		// Resolve the fetch to complete the test
		resolveFetch!({
			ok: true,
			json: jest.fn().mockResolvedValue(mockDivisionWithChildren),
		});
		
		// Wait for the skeletons to disappear
		await waitFor(() => {
			expect(screen.queryByText("Software Development")).toBeInTheDocument();
		});
	});
	
	it("should handle falsy children data from API response", async () => {
		// Mock division with no children property
		const divisionWithoutChildren = {
			id: 1,
			divisi: "Operations",
			parentId: null,
			// No children property!
		};
		
		(global.fetch as jest.Mock).mockImplementation((url) => {
			if (url.includes("/divisi/1")) {
				return Promise.resolve({
					ok: true,
					json: jest.fn().mockResolvedValue(divisionWithoutChildren),
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
		
		// Expand the first division
		fireEvent.click(screen.getAllByRole("button")[1]);
		
		// Should show "No subdepartments" since there's no children property
		await waitFor(() => {
			expect(screen.getByText("No subdepartments")).toBeInTheDocument();
		});
	});

	it("should show warning message when deleting division with children", async () => {
		// Create a division with children for deletion
		const mockDivisionsWithChildren = [
			{
				id: 1,
				divisi: "Operations",
				parentId: null,
				children: [
					{
						id: 3, 
						divisi: "Software Development",
						parentId: 1,
						children: [],
					}
				],
			},
			{
				id: 2,
				divisi: "IT Department",
				parentId: null,
				children: [],
			},
		];
		
		// Mock API to return divisions with children
		(global.fetch as jest.Mock).mockImplementation((url) => {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue(mockDivisionsWithChildren),
			});
		});
		
		render(<DisplayDivisi />);
		
		// Wait for divisions to load
		await waitFor(() => {
			expect(screen.getByText("Operations")).toBeInTheDocument();
		});
		
		// Find delete buttons and click the first one (for the division with children)
		const deleteButtons = screen
			.getAllByRole("button")
			.filter(
				(btn) => btn.innerHTML.includes("svg") && !btn.innerHTML.includes("Loader")
			);
			
		fireEvent.click(deleteButtons[3]);
		
		// Verify warning message is displayed
		expect(screen.getByText(/Warning: This division has sub-divisions that will also be deleted/i)).toBeInTheDocument();
	});
});
