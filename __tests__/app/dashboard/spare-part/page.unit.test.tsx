// __tests__/app/dashboard/spare-part/page.extended.unit.test.tsx

import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import SparePartDisplayPage from '@/app/dashboard/spare-part/page';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

// Set the API URL for tests
beforeAll(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000';
});

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

describe("SparepartDisplay Extended Tests", () => {
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test navigation functions (lines 44-45, 52)
  it("navigates to view details page when view button is clicked", async () => {
    render(<SparePartDisplayPage />);

    // Wait for the component to load data
    await waitFor(() => {
      expect(screen.getByText("Spare Part 1")).toBeInTheDocument();
    });

    // Find all buttons in the row of the first spare part
    const firstSparePartRow = screen.getByText("Spare Part 1").closest('tr');
    if (!firstSparePartRow) {
      throw new Error('Spare part row not found');
    }
    
    // Get the first button in the actions cell (view button)
    const viewButton = within(firstSparePartRow).getAllByRole('button')[0];
    fireEvent.click(viewButton);

    // Verify navigation occurred
    expect(mockPush).toHaveBeenCalledWith('/dashboard/spare-part/1');
  });

  it("navigates to edit page when edit button is clicked", async () => {
    render(<SparePartDisplayPage />);

    // Wait for the component to load data
    await waitFor(() => {
      expect(screen.getByText("Spare Part 1")).toBeInTheDocument();
    });

    // Find all buttons in the row of the first spare part
    const firstSparePartRow = screen.getByText("Spare Part 1").closest('tr');
    if (!firstSparePartRow) {
      throw new Error('Spare part row not found');
    }
    
    // Get the second button in the actions cell (edit button)
    const editButton = within(firstSparePartRow).getAllByRole('button')[1];
    fireEvent.click(editButton);

    // Verify navigation occurred
    expect(mockPush).toHaveBeenCalledWith('/dashboard/spare-part/1/edit');
  });

  it("navigates to create page when add new button is clicked", async () => {
    render(<SparePartDisplayPage />);

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText("Daftar Suku Cadang")).toBeInTheDocument();
    });

    // Find and click the "Tambah Suku Cadang" button
    const addButton = screen.getByText("Tambah Suku Cadang");
    fireEvent.click(addButton);

    // Verify navigation occurred
    expect(mockPush).toHaveBeenCalledWith('/dashboard/spare-part/create');
  });

  // Test search functionality (lines 94, 99, 103)
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
  });

  // Test formatting functions (lines 107, 111)
  it("formats currency correctly", async () => {
    render(<SparePartDisplayPage />);

    // Wait for data to load and formatting to be applied
    await waitFor(() => {
      // Price for first spare part should be formatted as Indonesian currency
      expect(screen.getByText("Rp 10.000")).toBeInTheDocument();
      // Price for second spare part
      expect(screen.getByText("Rp 25.000")).toBeInTheDocument();
    });
  });

  it("formats dates correctly", async () => {
    render(<SparePartDisplayPage />);

    // Wait for data to load and formatting to be applied
    await waitFor(() => {
      // Check for formatted dates (in Indonesian format)
      expect(screen.getByText("1 Januari 2023")).toBeInTheDocument();
      expect(screen.getByText("15 Februari 2023")).toBeInTheDocument();
    });
  });

  // Test invalid date handling (line 115-123)
  it("handles invalid dates gracefully", async () => {
    const sparepartsWithInvalidDate = [
      {
        id: "3",
        partsName: "Invalid Date Part",
        purchaseDate: "invalid-date",
        price: 15000,
        toolLocation: "Location 3"
      }
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => sparepartsWithInvalidDate,
    });

    render(<SparePartDisplayPage />);

    // Wait for data to load
    await waitFor(() => {
      // Check for the "Invalid Date" text for the problematic date
      expect(screen.getByText("Invalid Date")).toBeInTheDocument();
    });
  });

  // Test empty token scenario (lines 142-151)
  it("shows error toast when token is missing", async () => {
    // Mock the cookie to return null (no token)
    (Cookies.get as jest.Mock).mockReturnValueOnce(null);

    render(<SparePartDisplayPage />);

    // Verify error toast was called
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("No authentication token found");
    });

    // Verify fetch was not called
    expect(global.fetch).not.toHaveBeenCalled();
  });

  // Test filter button (lines 201-208)
  it("shows toast when filter button is clicked", async () => {
    render(<SparePartDisplayPage />);

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText("Filter")).toBeInTheDocument();
    });

    // Find and click the filter button
    const filterButton = screen.getByText("Filter");
    fireEvent.click(filterButton);

    // Verify toast was called
    expect(toast.error).toHaveBeenCalledWith("Filter functionality coming soon");
  });

  // Test empty search results (lines 236-244)
  it("displays empty state message when no results match search", async () => {
    // First render with data
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSpareparts,
    });

    render(<SparePartDisplayPage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("Spare Part 1")).toBeInTheDocument();
    });

    // Setup for empty results
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    // Search for something that doesn't exist
    const searchInput = screen.getByPlaceholderText("Cari suku cadang...");
    fireEvent.change(searchInput, { target: { value: "NonexistentPart" } });
    
    const form = searchInput.closest('form');
    if (!form) {
      throw new Error('Form not found');
    }
    fireEvent.submit(form);

    // Check for empty state message
    await waitFor(() => {
      expect(screen.getByText("Tidak ada suku cadang yang cocok dengan pencarian Anda")).toBeInTheDocument();
    });
  });

  // Test empty data state (no search)
  it("displays empty state message when no data exists", async () => {
    // Mock empty data response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<SparePartDisplayPage />);

    // Check for empty state message
    await waitFor(() => {
      expect(screen.getByText("Tidak ada data suku cadang")).toBeInTheDocument();
    });
  });
});