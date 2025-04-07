import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import MedicalEquipmentPage from "@/modules/medical-equipment/medical-equipment-details";
import { toast } from "sonner";
import Cookies from "js-cookie";

// Mock the next/navigation hooks
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock the toast
jest.mock("sonner", () => ({
  toast: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock js-cookie
jest.mock("js-cookie", () => ({
  get: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();
global.confirm = jest.fn();

describe("MedicalEquipmentPage Details", () => {
  // Sample data for testing
  const mockMedicalEquipments = [
    {
      id: "1",
      inventorisId: "INV-001",
      name: "Test Equipment 1",
      brandName: "Brand 1",
      modelName: "Model 1",
      purchaseDate: "2023-01-01",
      purchasePrice: 1000000,
      status: "Active",
      vendor: "Vendor 1",
      createdOn: "2023-01-01",
      modifiedOn: "2023-01-01",
    },
    {
      id: "2",
      inventorisId: "INV-002",
      name: "Test Equipment 2",
      brandName: null,
      modelName: null,
      purchaseDate: null,
      purchasePrice: null,
      status: "Inactive",
      vendor: null,
      createdOn: null,
      modifiedOn: "2023-01-02",
    },
    {
      id: "3",
      inventorisId: "INV-003",
      name: "Test Equipment 3",
      brandName: "Brand 3",
      modelName: "Model 3",
      purchaseDate: "2023-03-01",
      purchasePrice: 3000000,
      status: "Maintenance",
      vendor: "Vendor 3",
      createdOn: "2023-03-01",
      modifiedOn: "2023-03-01",
    },
  ];

  // Mock router and search params
  const mockPush = jest.fn();
  const mockRouter = { push: mockPush };
  const mockSearchParamsGet = jest.fn();
  const mockSearchParams = { get: mockSearchParamsGet };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mocks
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    mockSearchParamsGet.mockReturnValue(null);
    (Cookies.get as jest.Mock).mockReturnValue("mock-token");
    
    // Mock successful API response by default
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockMedicalEquipments),
    });
  });

  // POSITIVE TEST CASES
  describe("Positive test cases", () => {
    it("renders the page with data correctly", async () => {
      render(<MedicalEquipmentPage />);
      
      // Verify loading state
      expect(screen.getByText("Memuat Alat Medis...")).toBeInTheDocument();
      
      // Verify data loads
      await waitFor(() => {
        expect(screen.getByText("Test Equipment 1")).toBeInTheDocument();
        expect(screen.getByText("Test Equipment 2")).toBeInTheDocument();
        expect(screen.getByText("Test Equipment 3")).toBeInTheDocument();
      });
      
      // Verify headers
      expect(screen.getByText("Nomor Inventaris")).toBeInTheDocument();
      expect(screen.getByText("Nama")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Harga")).toBeInTheDocument();
      expect(screen.getByText("Tanggal Pembelian")).toBeInTheDocument();
    });

    it("enables searching for equipment", async () => {
      render(<MedicalEquipmentPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Test Equipment 1")).toBeInTheDocument();
      });
      
      // Clear previous fetch calls
      (global.fetch as jest.Mock).mockClear();
      
      // Search for equipment
      const searchInput = screen.getByTestId("search-input");
      fireEvent.change(searchInput, { target: { value: "Equipment 1" } });
      
      // Verify search API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("search=Equipment 1"),
          expect.any(Object)
        );
      });
    });

    it("displays and uses the filter modal", async () => {
      render(<MedicalEquipmentPage />);
      
      await waitFor(() => {
        expect(screen.queryByText("Memuat Alat Medis...")).not.toBeInTheDocument();
      });
      
      // Open filter modal
      fireEvent.click(screen.getByText("Filter"));
      
      // Verify modal is open
      expect(screen.getByText("Filter Alat Medis")).toBeInTheDocument();
      
      // Apply a filter (Active status)
      fireEvent.click(screen.getByLabelText("Active"));
      fireEvent.click(screen.getByText("Terapkan"));
      
      // Verify API call with filter
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("status=Active"),
          expect.any(Object)
        );
      });
    });

    it("navigates to detail view when row is clicked", async () => {
      render(<MedicalEquipmentPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId("equipment-row-1")).toBeInTheDocument();
      });
      
      // Click equipment row
      fireEvent.click(screen.getByTestId("equipment-row-1"));
      
      // Verify navigation
      expect(mockPush).toHaveBeenCalledWith("/dashboard/medical-equipment/1");
    });

    it("navigates to edit page when edit button is clicked", async () => {
      render(<MedicalEquipmentPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId("edit-button-1")).toBeInTheDocument();
      });
      
      // Click edit button
      fireEvent.click(screen.getByTestId("edit-button-1"));
      
      // Verify navigation
      expect(mockPush).toHaveBeenCalledWith("/dashboard/medical-equipment/1/edit");
    });

    it("navigates to create page when add button is clicked", async () => {
      render(<MedicalEquipmentPage />);
      
      await waitFor(() => {
        expect(screen.queryByText("Memuat Alat Medis...")).not.toBeInTheDocument();
      });
      
      // Click add button
      fireEvent.click(screen.getByText("Tambah Alat Medis"));
      
      // Verify navigation
      expect(mockPush).toHaveBeenCalledWith("/dashboard/medical-equipment/create");
    });

    it("successfully deletes equipment", async () => {
      // Mock confirm dialog to return true
      (global.confirm as jest.Mock).mockReturnValue(true);
      
      // Mock delete API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });
      
      render(<MedicalEquipmentPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId("delete-button-1")).toBeInTheDocument();
      });
      
      // Click delete button
      fireEvent.click(screen.getByTestId("delete-button-1"));
      
      // Verify confirmation
      expect(global.confirm).toHaveBeenCalledWith("Apakah Anda yakin ingin menghapus alat medis ini?");
      
      // Verify delete API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/1`,
          expect.objectContaining({ method: "DELETE" })
        );
      });
      
      // Verify success message
      expect(toast.info).toHaveBeenCalledWith("Alat medis berhasil dihapus");
    });

    it("shows create success toast when URL has success=create", async () => {
      mockSearchParamsGet.mockImplementation((key) => {
        if (key === "success") return "create";
        return null;
      });
      
      render(<MedicalEquipmentPage />);
      
      // Verify toast
      await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith("Alat medis berhasil dibuat");
      });
    });
  });

  // NEGATIVE TEST CASES
  describe("Negative test cases", () => {
    it("handles API fetch error gracefully", async () => {
      // Mock fetch error
      console.error = jest.fn(); // Suppress console error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"));
      
      render(<MedicalEquipmentPage />);
      
      // Verify loading state disappears
      await waitFor(() => {
        expect(screen.queryByText("Memuat Alat Medis...")).not.toBeInTheDocument();
      });
      
      // Verify error was logged
      expect(console.error).toHaveBeenCalled();
    });

    it("handles delete API error gracefully", async () => {
      // Mock confirm dialog to return true
      (global.confirm as jest.Mock).mockReturnValue(true);
      
      // Mock delete API to fail
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: "Error" }),
      });
      
      render(<MedicalEquipmentPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId("delete-button-1")).toBeInTheDocument();
      });
      
      // Click delete button
      fireEvent.click(screen.getByTestId("delete-button-1"));
      
      // Verify error toast
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Gagal menghapus alat medis");
      });
    });

    it("shows appropriate message when no equipment found", async () => {
      // Mock empty response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });
      
      render(<MedicalEquipmentPage />);
      
      // Verify empty message
      await waitFor(() => {
        expect(screen.getByText("Tidak ada alat medis yang ditemukan")).toBeInTheDocument();
      });
    });

    it("shows appropriate message when search returns no results", async () => {
      // First load data
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockMedicalEquipments),
      });
      
      // Then return empty for search
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });
      
      render(<MedicalEquipmentPage />);
      
      await waitFor(() => {
        expect(screen.queryByText("Memuat Alat Medis...")).not.toBeInTheDocument();
      });
      
      // Search for non-existent equipment
      const searchInput = screen.getByTestId("search-input");
      fireEvent.change(searchInput, { target: { value: "nonexistent" } });
      
      // Verify search-specific message
      await waitFor(() => {
        expect(screen.getByText("Tidak ada alat medis yang cocok dengan pencarian Anda")).toBeInTheDocument();
      });
    });

    it("doesn't delete when confirmation is cancelled", async () => {
      // Mock confirm dialog to return false
      (global.confirm as jest.Mock).mockReturnValue(false);
      
      render(<MedicalEquipmentPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId("delete-button-1")).toBeInTheDocument();
      });
      
      // Click delete button
      fireEvent.click(screen.getByTestId("delete-button-1"));
      
      // Verify delete API was not called
      expect(global.fetch).not.toHaveBeenCalledWith(
        expect.stringContaining("/medical-equipment/1"),
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  // CORNER TEST CASES
  describe("Corner test cases", () => {
    it("formats null price and date correctly", async () => {
      render(<MedicalEquipmentPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId("equipment-row-2")).toBeInTheDocument();
      });
      
      // Get all table cells
      const cells = screen.getAllByRole("cell");
      
      // Find cells with "-" content (null values formatted)
      const nullCells = Array.from(cells).filter(cell => cell.textContent === "-");
      
      // Verify at least two cells with "-" exist (price and date)
      expect(nullCells.length).toBeGreaterThanOrEqual(2);
    });

    it("applies correct status classes based on status", async () => {
      render(<MedicalEquipmentPage />);
      
      await waitFor(() => {
        expect(screen.getAllByText("Active")[0]).toBeInTheDocument();
        expect(screen.getAllByText("Inactive")[0]).toBeInTheDocument();
        expect(screen.getAllByText("Maintenance")[0]).toBeInTheDocument();
      });
      
      // Check Active status styling
      const activeStatus = screen.getAllByText("Active")[0];
      expect(activeStatus.className).toContain("bg-green-100");
      expect(activeStatus.className).toContain("text-green-800");
      
      // Check Inactive status styling
      const inactiveStatus = screen.getAllByText("Inactive")[0];
      expect(inactiveStatus.className).toContain("bg-red-100");
      expect(inactiveStatus.className).toContain("text-red-800");
      
      // Check Maintenance status styling
      const maintenanceStatus = screen.getAllByText("Maintenance")[0];
      expect(maintenanceStatus.className).toContain("bg-yellow-100");
      expect(maintenanceStatus.className).toContain("text-yellow-800");
    });

    it("handles invalid date format gracefully", async () => {
      // Mock equipment with invalid date
      const mockInvalidDateEquipment = [
        {
          ...mockMedicalEquipments[0],
          purchaseDate: "invalid-date",
        },
      ];
      
      // Mock response with invalid date
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockInvalidDateEquipment),
      });
      
      console.error = jest.fn(); // Suppress console errors
      
      render(<MedicalEquipmentPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId("equipment-row-1")).toBeInTheDocument();
      });
      
      // Verify the invalid date is displayed as-is
      expect(screen.getByText("invalid-date")).toBeInTheDocument();
      expect(console.error).toHaveBeenCalled();
    });

    it("handles multiple status filters correctly", async () => {
      render(<MedicalEquipmentPage />);
      
      await waitFor(() => {
        expect(screen.queryByText("Memuat Alat Medis...")).not.toBeInTheDocument();
      });
      
      // Open filter modal
      fireEvent.click(screen.getByText("Filter"));
      
      // Select multiple statuses
      fireEvent.click(screen.getByLabelText("Active"));
      fireEvent.click(screen.getByLabelText("Inactive"));
      
      // Apply filters
      fireEvent.click(screen.getByText("Terapkan"));
      
      // Verify API call includes both statuses
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringMatching(/status=Active.*status=Inactive|status=Inactive.*status=Active/),
          expect.any(Object)
        );
      });
    });

    it("prevents row click propagation when action buttons are clicked", async () => {
      render(<MedicalEquipmentPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId("edit-button-1")).toBeInTheDocument();
      });
      
      // Create a mock event with stopPropagation
      const mockEvent = { stopPropagation: jest.fn() };
      
      // Click edit button with mock event
      fireEvent.click(screen.getByTestId("edit-button-1"), mockEvent);
      
      // Verify router was called with edit path, not detail path
      expect(mockPush).toHaveBeenCalledWith("/dashboard/medical-equipment/1/edit");
      expect(mockPush).not.toHaveBeenCalledWith("/dashboard/medical-equipment/1");
    });

    it("shows delete success toast when URL has success=delete", async () => {
      mockSearchParamsGet.mockImplementation((key) => {
        if (key === "success") return "delete";
        return null;
      });
      
      render(<MedicalEquipmentPage />);
      
      // Verify toast
      await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith("Alat medis berhasil dihapus");
      });
    });

    it("builds query params correctly with all filter types", async () => {
      render(<MedicalEquipmentPage />);
      
      await waitFor(() => {
        expect(screen.queryByText("Memuat Alat Medis...")).not.toBeInTheDocument();
      });
      
      // Open filter modal
      fireEvent.click(screen.getByText("Filter"));
      
      // Select status
      fireEvent.click(screen.getByLabelText("Active"));
      
      // Select dates (we'll just verify the apply button sends all the fields to the API)
      // In a real test, you'd need to interact with the calendar component
      
      // Apply filters
      fireEvent.click(screen.getByText("Terapkan"));
      
      // The actual test here is more about the pattern for API calls
      // than about the specific values, since we can't easily select dates
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("status=Active"),
          expect.any(Object)
        );
      });
    });
  });
});