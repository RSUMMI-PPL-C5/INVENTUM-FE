import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SparePartDisplayPage from '@/app/dashboard/spare-part/page';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

// Mock router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
  })),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("js-cookie", () => ({
  get: jest.fn().mockReturnValue("mock-token"),
}));

// Mock confirm
global.confirm = jest.fn();

describe("SparepartDisplay Component", () => {
  const mockSpareparts = [
    {
      id: "1",
      partsName: "Spare Part 1",
      purchaseDate: "2023-01-01T00:00:00.000Z",
      price: 10000,
      toolLocation: "Location 1"
    },
    {
      id: "2",
      partsName: "Spare Part 2",
      purchaseDate: "2023-02-15T00:00:00.000Z",
      price: 25000,
      toolLocation: "Location 2"
    }
  ];

  beforeEach(() => {
    (Cookies.get as jest.Mock).mockReturnValue("mock-token");
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSpareparts,
    });
    mockPush.mockClear();
    (toast.success as jest.Mock).mockClear();
    (toast.error as jest.Mock).mockClear();
    (global.confirm as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Basic rendering test
  it("renders the component with heading", async () => {
    render(<SparePartDisplayPage />);
    
    // Check for the heading
    const heading = await screen.findByText('Daftar Suku Cadang');
    expect(heading).toBeInTheDocument();
  });

  // Data fetching test
  it("fetches spare parts on component mount", async () => {
    render(<SparePartDisplayPage />);

    // Wait for the fetch call to be made
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/spareparts`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer mock-token",
            "Content-Type": "application/json",
          },
        }
      );
    });

    // Wait for the spare part data to appear
    await waitFor(() => {
      expect(screen.getByText("Spare Part 1")).toBeInTheDocument();
      expect(screen.getByText("Spare Part 2")).toBeInTheDocument();
    });
  });

  // Navigation tests
  describe("Navigation Functions", () => {
    it("navigates to view details page when row is clicked", async () => {
      render(<SparePartDisplayPage />);
  
      // Wait for the spare parts to load
      await waitFor(() => {
        expect(screen.getByText("Spare Part 1")).toBeInTheDocument();
      });
  
      // Find and click on the row (not on a button)
      const row = screen.getByTestId("sparepart-row-1");
      fireEvent.click(row);
  
      // Verify navigation to details page
      expect(mockPush).toHaveBeenCalledWith("/dashboard/spare-part/1");
    });
  
    it("navigates to edit page when edit button is clicked", async () => {
      render(<SparePartDisplayPage />);
  
      // Wait for the component to load data
      await waitFor(() => {
        expect(screen.getByText("Spare Part 1")).toBeInTheDocument();
      });
  
      // Find and click the edit button
      const editButton = screen.getByTestId("edit-button-1");
      fireEvent.click(editButton);
  
      // Verify navigation
      expect(mockPush).toHaveBeenCalledWith("/dashboard/spare-part/1/edit");
    });
  
    it("navigates to create page when add new button is clicked", async () => {
      render(<SparePartDisplayPage />);
  
      // Wait for the component to load
      await waitFor(() => {
        expect(screen.getByText("Tambah Suku Cadang")).toBeInTheDocument();
      });
  
      // Find and click the create button
      const createButton = screen.getByText("Tambah Suku Cadang");
      fireEvent.click(createButton);
  
      // Verify navigation
      expect(mockPush).toHaveBeenCalledWith("/dashboard/spare-part/create");
    });
  });

  // Delete functionality tests
  describe("Delete Functionality", () => {
    it("shows confirmation dialog when delete button is clicked", async () => {
      // Mock confirm to return true
      (global.confirm as jest.Mock).mockReturnValueOnce(true);
  
      // Mock the delete API call
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSpareparts,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSpareparts.filter(item => item.id !== "1"),
        });
  
      render(<SparePartDisplayPage />);
  
      // Wait for the spare parts to load
      await waitFor(() => {
        expect(screen.getByText("Spare Part 1")).toBeInTheDocument();
      });
  
      // Find and click the delete button for the first spare part
      const deleteButton = screen.getByTestId("delete-button-1");
      fireEvent.click(deleteButton);
  
      // Verify confirmation dialog was shown
      expect(global.confirm).toHaveBeenCalledWith(
        "Apakah Anda yakin ingin menghapus suku cadang ini?"
      );
  
      // Verify delete API call was made
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `${process.env.NEXT_PUBLIC_API_URL}/spareparts/1`,
          {
            method: "DELETE",
            headers: {
              Authorization: "Bearer mock-token",
              "Content-Type": "application/json",
            },
          }
        );
      });
  
      // Verify success toast was shown
      expect(toast.success).toHaveBeenCalledWith(
        "Suku cadang berhasil dihapus"
      );
    });
  
    it("does not delete spare part when cancel is clicked in confirmation", async () => {
      // Mock confirm to return false (cancel)
      (global.confirm as jest.Mock).mockReturnValueOnce(false);
  
      render(<SparePartDisplayPage />);
  
      // Wait for the spare parts to load
      await waitFor(() => {
        expect(screen.getByText("Spare Part 1")).toBeInTheDocument();
      });
  
      // Clear previous fetch calls
      (global.fetch as jest.Mock).mockClear();
  
      // Find and click the delete button for the first spare part
      const deleteButton = screen.getByTestId("delete-button-1");
      fireEvent.click(deleteButton);
  
      // Verify confirmation dialog was shown
      expect(global.confirm).toHaveBeenCalledWith(
        "Apakah Anda yakin ingin menghapus suku cadang ini?"
      );
  
      // Verify no delete API call was made
      expect(global.fetch).not.toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/spareparts/1`,
        expect.objectContaining({
          method: "DELETE",
        })
      );
  
      // Verify no success toast was shown
      expect(toast.success).not.toHaveBeenCalled();
    });
  
    it("handles delete API error", async () => {
      // Mock confirm to return true
      (global.confirm as jest.Mock).mockReturnValueOnce(true);
  
      // Mock the first fetch for loading spareparts
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSpareparts,
        })
        // Mock the delete API call to fail
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ message: "Failed to delete spare part" }),
        });
  
      render(<SparePartDisplayPage />);
  
      // Wait for the spare parts to load
      await waitFor(() => {
        expect(screen.getByText("Spare Part 1")).toBeInTheDocument();
      });
  
      // Find and click the delete button for the first spare part
      const deleteButton = screen.getByTestId("delete-button-1");
      fireEvent.click(deleteButton);
  
      // Verify error toast was shown
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Gagal menghapus suku cadang");
      });
    });
  });

  // Search functionality tests
  describe("Search Functionality", () => {
    it("handles search input change", async () => {
      render(<SparePartDisplayPage />);
  
      // Wait for the component to load
      await waitFor(() => {
        expect(screen.getByPlaceholderText("Cari suku cadang...")).toBeInTheDocument();
      });
  
      // Find the search input and type in it
      const searchInput = screen.getByPlaceholderText("Cari suku cadang...");
      fireEvent.change(searchInput, { target: { value: "Test Search" } });
  
      // Verify input value changed
      expect(searchInput).toHaveValue("Test Search");
    });
  
    it("fetches with search parameter when search is submitted", async () => {
      render(<SparePartDisplayPage />);
  
      // Wait for the component to load
      await waitFor(() => {
        expect(screen.getByPlaceholderText("Cari suku cadang...")).toBeInTheDocument();
      });
  
      // Find the search input, type in it, and submit the form
      const searchInput = screen.getByPlaceholderText("Cari suku cadang...");
      fireEvent.change(searchInput, { target: { value: "Test Search" } });
      
      // Clear previous fetch calls
      (global.fetch as jest.Mock).mockClear();
      
      // Mock the search result
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });
      
      // Submit the form
      const form = searchInput.closest('form');
      if (!form) {
        throw new Error('Form not found');
      }
      fireEvent.submit(form);
  
      // Verify fetch was called with search parameter
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `${process.env.NEXT_PUBLIC_API_URL}/spareparts?partsName=Test%20Search`,
          expect.any(Object)
        );
      });
  
      // Verify empty results message
      await waitFor(() => {
        expect(screen.getByText("Tidak ada suku cadang yang cocok dengan pencarian Anda")).toBeInTheDocument();
      });
    });
  });

  // Formatting tests
  describe("Formatting Functions", () => {
    it("formats currency correctly", async () => {
      // Mock data with different price values to test formatting
      const mockSparepartsWithDifferentPrices = [
        {
          id: "1",
          partsName: "Expensive Part",
          purchaseDate: "2023-01-01T00:00:00.000Z",
          price: 1000000, // 1,000,000
          toolLocation: "Location 1"
        },
        {
          id: "2",
          partsName: "Cheap Part",
          purchaseDate: "2023-01-01T00:00:00.000Z",
          price: 0, // Zero
          toolLocation: "Location 2"
        }
      ];
  
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSparepartsWithDifferentPrices,
      });
  
      render(<SparePartDisplayPage />);
  
      // Verify the currency formatting for both cases
      await waitFor(() => {
        expect(screen.getByText("Rp 1.000.000")).toBeInTheDocument();
        expect(screen.getByText("Rp 0")).toBeInTheDocument();
      });
    });
  
    it("formats dates correctly", async () => {
      const mockSparepartsWithDifferentDates = [
        {
          id: "1",
          partsName: "ISO Format Part",
          purchaseDate: "2023-01-01T00:00:00.000Z", // ISO format
          price: 10000,
          toolLocation: "Location 1"
        },
        {
          id: "2",
          partsName: "Short Format Part",
          purchaseDate: "2023/02/15", // Different format
          price: 10000,
          toolLocation: "Location 2"
        },
        {
          id: "3",
          partsName: "Timestamp Part",
          purchaseDate: new Date(2023, 5, 30).toISOString(), // June 30, 2023
          price: 10000,
          toolLocation: "Location 3"
        }
      ];
  
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSparepartsWithDifferentDates,
      });
  
      render(<SparePartDisplayPage />);
  
      // Verify the date formatting for different date formats
      await waitFor(() => {
        expect(screen.getByText("1 Januari 2023")).toBeInTheDocument();
        expect(screen.getByText("15 Februari 2023")).toBeInTheDocument();
        expect(screen.getByText("30 Juni 2023")).toBeInTheDocument();
      });
    });
  
    it("handles invalid dates gracefully", async () => {
      const mockSparepartsWithInvalidDate = [
        {
          id: "3",
          partsName: "Invalid Date Part",
          purchaseDate: "invalid-date-format",
          price: 15000,
          toolLocation: "Location 3"
        }
      ];
  
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true, 
        json: async () => mockSparepartsWithInvalidDate,
      });
  
      render(<SparePartDisplayPage />);
  
      // Wait for component to load with invalid date
      await waitFor(() => {
        expect(screen.getByText("Invalid Date Part")).toBeInTheDocument();
        expect(screen.getByText("Invalid Date")).toBeInTheDocument();
      });
    });
  });

  // Error handling tests
  describe("Error Handling", () => {
    it("handles missing authentication token", async () => {
      // Mock Cookies.get to return null (no token)
      (Cookies.get as jest.Mock).mockReturnValueOnce(null);
  
      render(<SparePartDisplayPage />);
  
      // Verify error toast was shown
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("No authentication token found");
      });
  
      // Verify fetch was not called
      expect(global.fetch).not.toHaveBeenCalled();
    });
  
    it("handles API error when fetching spare parts", async () => {
      // Mock fetch to return error
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "API error occurred" }),
      });
  
      render(<SparePartDisplayPage />);
  
      // Verify error toast was shown
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("API error occurred");
      });
    });
  
    it("handles network errors when fetching spare parts", async () => {
      // Mock fetch to throw network error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
  
      render(<SparePartDisplayPage />);
  
      // Verify error toast was shown
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Network error");
      });
    });
  });

  // UI state tests
  describe("UI States", () => {
    it("displays loading state initially", async () => {
      // Delay the API response to ensure loading state is visible
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => 
          resolve({
            ok: true,
            json: async () => mockSpareparts,
          }), 100))
      );
  
      render(<SparePartDisplayPage />);
      
      // Check for loading state
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  
    it("displays empty state message when no spare parts exist", async () => {
      // Mock empty data response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });
  
      render(<SparePartDisplayPage />);
  
      // Verify empty state message
      await waitFor(() => {
        const emptyMessage = screen.getByText("Tidak ada data suku cadang");
        expect(emptyMessage).toBeInTheDocument();
        
        // Check colSpan attribute
        const cell = emptyMessage.closest('td');
        expect(cell).toHaveAttribute('colSpan', '5');
      });
    });
  
    it("shows empty search results message when search has no results", async () => {
      // First load with data
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSpareparts,
      });
  
      render(<SparePartDisplayPage />);
  
      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText("Spare Part 1")).toBeInTheDocument();
      });
  
      // Setup for empty search results
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });
  
      // Perform search
      const searchInput = screen.getByPlaceholderText("Cari suku cadang...");
      fireEvent.change(searchInput, { target: { value: "NonexistentPart" } });
      
      const form = searchInput.closest('form');
      if (!form) {
        throw new Error('Form not found');
      }
      fireEvent.submit(form);
  
      // Check for empty search results message
      await waitFor(() => {
        expect(screen.getByText("Tidak ada suku cadang yang cocok dengan pencarian Anda")).toBeInTheDocument();
      });
    });
  
    it("shows error toast when filter button is clicked", async () => {
      render(<SparePartDisplayPage />);
  
      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText("Filter")).toBeInTheDocument();
      });
  
      // Find and click filter button
      const filterButton = screen.getByText("Filter");
      fireEvent.click(filterButton);
  
      // Verify error toast was shown
      expect(toast.error).toHaveBeenCalledWith("Filter functionality coming soon");
    });
  });
  it("prevents event propagation when clicking action buttons", async () => {
    render(<SparePartDisplayPage />);
  
    await waitFor(() => {
      expect(screen.getByText("Spare Part 1")).toBeInTheDocument();
    });
  
    // Reset mockPush to track if it's called
    mockPush.mockClear();
  
    // The key difference: Instead of testing stopPropagation directly,
    // we'll test the overall effect - clicking edit button should not trigger row navigation
    
    // Find the edit button for the first sparepart
    const editButton = screen.getByTestId("edit-button-1");
    
    // Click the edit button
    fireEvent.click(editButton);
  
    // Verify that the router pushed to edit page, not details page
    expect(mockPush).toHaveBeenCalledWith("/dashboard/spare-part/1/edit");
    expect(mockPush).not.toHaveBeenCalledWith("/dashboard/spare-part/1");
  
    // Reset mockPush
    mockPush.mockClear();
  
    // Similarly for delete button
    const deleteButton = screen.getByTestId("delete-button-1");
    
    // Mock confirm to return false to avoid actual delete logic
    (global.confirm as jest.Mock).mockReturnValueOnce(false);
    
    // Click the delete button
    fireEvent.click(deleteButton);
  
    // Verify the confirmation was shown (meaning the button click was processed)
    expect(global.confirm).toHaveBeenCalled();
    
    // Verify that navigation didn't happen (the row click was not triggered)
    expect(mockPush).not.toHaveBeenCalled();
  });
});