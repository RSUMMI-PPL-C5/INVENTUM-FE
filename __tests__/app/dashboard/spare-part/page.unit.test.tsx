// __tests__/app/dashboard/spare-part/page.unit.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import SparePartDisplayPage from '@/app/dashboard/spare-part/page';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

// Set the API URL for tests
beforeAll(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000';
});

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
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

describe("SparepartDisplay", () => {
  beforeEach(() => {
    (Cookies.get as jest.Mock).mockReturnValue("mock-token");
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // First test: check if the component renders the heading
  it("renders the component heading", async () => {
    render(<SparePartDisplayPage />);
    
    // Wait for the heading to be displayed
    const heading = await screen.findByText('Daftar Suku Cadang');
    expect(heading).toBeInTheDocument();
  });

  // Second test: check fetching and displaying data
  it("fetches spare parts on component mount", async () => {
    const mockSpareparts = [
      {
        id: "1",
        partsName: "Spare Part 1",
        purchaseDate: "2023-01-01T00:00:00.000Z",
        price: 10000,
        toolLocation: "Location 1"
      }
    ];

    // Mock the fetch response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSpareparts,
    });

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
    const sparePartElement = await screen.findByText("Spare Part 1");
    expect(sparePartElement).toBeInTheDocument();
  });

  it("handles API errors gracefully", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Error fetching spare parts" }),
    });

    render(<SparePartDisplayPage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error fetching spare parts");
    });
  });


  it("displays spare parts in a formatted table", async () => {
    const mockSpareparts = [
      {
        id: "1",
        partsName: "Spare Part 1",
        purchaseDate: "2023-01-01T00:00:00.000Z",
        price: 10000,
        toolLocation: "Location 1"
      }
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSpareparts,
    });

    render(<SparePartDisplayPage />);

    await waitFor(() => {
      // Check for table headers
      expect(screen.getByText("Nama Suku Cadang")).toBeInTheDocument();
      expect(screen.getByText("Tanggal Pembelian")).toBeInTheDocument();
      expect(screen.getByText("Harga")).toBeInTheDocument();
      expect(screen.getByText("Lokasi")).toBeInTheDocument();
      
      // Check for the data
      expect(screen.getByText("Spare Part 1")).toBeInTheDocument();
      expect(screen.getByText("Location 1")).toBeInTheDocument();
      
      // Price should be formatted as Indonesian currency
      expect(screen.getByText("Rp 10.000")).toBeInTheDocument();
    });
  });
});