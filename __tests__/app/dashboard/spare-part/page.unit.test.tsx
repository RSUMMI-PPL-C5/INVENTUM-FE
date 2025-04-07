import { render, screen, waitFor } from '@testing-library/react';
import SparePartDisplayPage from '@/app/dashboard/spare-part/page';
import {toast} from 'sonner';
import Cookies from 'js-cookie';


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

jest.mock('js-cookie', () => ({
  get: jest.fn(),
}));

describe("SparepartDisplay", () => {

  beforeEach(() => {
    (Cookies.get as jest.Mock).mockReturnValue("mock-token");
    
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the component page name", () => {
    render(<SparePartDisplayPage />);
    const pageName = screen.getByText('SparePartDisplay');
    expect(pageName).toBeInTheDocument();
  });

  // Add this to your test file
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

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSpareparts,
    });

    render(<SparePartDisplayPage />);

    // Check that fetch was called with correct URL and headers
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

    // Check that the spare part data appears in the component
    await waitFor(() => {
      expect(screen.getByText("Spare Part 1")).toBeInTheDocument();
    });
  });
});
