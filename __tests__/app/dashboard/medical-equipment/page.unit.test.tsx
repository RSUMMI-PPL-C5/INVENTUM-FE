import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import MedicalEquipmentPage from "@/modules/medical-equipment/medical-equipment-display";
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

describe("MedicalEquipmentPage", () => {
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

  // Positive Test Cases
  describe("Positive test cases", () => {
    it("renders the medical equipment page with data", async () => {
      render(<MedicalEquipmentPage />);

      // Check loading state is shown initially
      expect(screen.getByText("Memuat Alat Medis...")).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText("Test Equipment 1")).toBeInTheDocument();
        expect(screen.getByText("Test Equipment 2")).toBeInTheDocument();
        expect(screen.getByText("Test Equipment 3")).toBeInTheDocument();
      });

      // Check headers are rendered
      expect(screen.getByText("Nomor Inventaris")).toBeInTheDocument();
      expect(screen.getByText("Nama")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Harga")).toBeInTheDocument();
      expect(screen.getByText("Tanggal Pembelian")).toBeInTheDocument();
      expect(screen.getByText("Aksi")).toBeInTheDocument();
    });

    it("allows searching for medical equipment", async () => {
      render(<MedicalEquipmentPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Equipment 1")).toBeInTheDocument();
      });

      // Clear previous fetch calls
      (global.fetch as jest.Mock).mockClear();

      // Enter search term
      const searchInput = screen.getByTestId("search-input");
      fireEvent.change(searchInput, { target: { value: "Equipment 1" } });

      // Verify fetch was called with search parameter
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("search=Equipment 1"),
          expect.any(Object)
        );
      });
    });

    it("opens filter modal when filter button is clicked", async () => {
      render(<MedicalEquipmentPage />);

      await waitFor(() => {
        expect(screen.queryByText("Memuat Alat Medis...")).not.toBeInTheDocument();
      });

      // Click filter button
      fireEvent.click(screen.getByText("Filter"));

      // Check if filter modal is open
      expect(screen.getByText("Filter Alat Medis")).toBeInTheDocument();
    });

    it("applies filters and fetches filtered data", async () => {
      render(<MedicalEquipmentPage />);

      await waitFor(() => {
        expect(screen.queryByText("Memuat Alat Medis...")).not.toBeInTheDocument();
      });

      // Open filter modal
      fireEvent.click(screen.getByText("Filter"));

      // Select Active status
      fireEvent.click(screen.getByLabelText("Active"));

      // Apply filters
      fireEvent.click(screen.getByText("Terapkan"));

      // Verify fetch was called with status parameter
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("status=Active"),
          expect.any(Object)
        );
      });
    });

    it("navigates to equipment detail when row is clicked", async () => {
      render(<MedicalEquipmentPage />);

      await waitFor(() => {
        expect(screen.getByTestId("equipment-row-1")).toBeInTheDocument();
      });

      // Click on a row
      fireEvent.click(screen.getByTestId("equipment-row-1"));

      // Verify navigation
      expect(mockPush).toHaveBeenCalledWith("/dashboard/medical-equipment/1");
    });

    it("navigates to equipment edit page when edit button is clicked", async () => {
      render(<MedicalEquipmentPage />);

      await waitFor(() => {
        expect(screen.getByTestId("edit-button-1")).toBeInTheDocument();
      });

      // Click edit button
      fireEvent.click(screen.getByTestId("edit-button-1"));

      // Verify navigation
      expect(mockPush).toHaveBeenCalledWith("/dashboard/medical-equipment/1/edit");
    });

    it("navigates to equipment create page when add button is clicked", async () => {
      render(<MedicalEquipmentPage />);

      await waitFor(() => {
        expect(screen.queryByText("Memuat Alat Medis...")).not.toBeInTheDocument();
      });

      // Click add button
      fireEvent.click(screen.getByText("Tambah Alat Medis"));

      // Verify navigation
      expect(mockPush).toHaveBeenCalledWith("/dashboard/medical-equipment/create");
    });

    it("deletes equipment when delete button is clicked and confirmed", async () => {
      // Mock confirmation dialog to return true
      (global.confirm as jest.Mock).mockReturnValue(true);

      // Mock delete response
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

      // Verify confirmation dialog
      expect(global.confirm).toHaveBeenCalledWith("Apakah Anda yakin ingin menghapus alat medis ini?");

      // Verify delete API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/medical-equipment/1"),
          expect.objectContaining({ method: "DELETE" })
        );
      });

      // Verify success toast
      expect(toast.info).toHaveBeenCalledWith("Alat medis berhasil dihapus");
    });

    it("shows success toast when URL has success parameter", async () => {
      mockSearchParamsGet.mockImplementation((key) => {
        if (key === "success") return "create";
        return null;
      });

      render(<MedicalEquipmentPage />);

      // Wait for useEffect to run
      await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith("Alat medis berhasil dibuat");
      });
    });

    it("shows success toast when success=update parameter is present", async () => {
      mockSearchParamsGet.mockImplementation((key) => {
        if (key === "success") return "update";
        return null;
      });

      render(<MedicalEquipmentPage />);

      await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith("Alat medis berhasil diperbarui");
      });
    });

    it("closes filter modal when close button is clicked", async () => {
      render(<MedicalEquipmentPage />);

      await waitFor(() => {
        expect(screen.queryByText("Memuat Alat Medis...")).not.toBeInTheDocument();
      });

      // Open filter modal
      fireEvent.click(screen.getByText("Filter"));
      expect(screen.getByText("Filter Alat Medis")).toBeInTheDocument();

      // Close filter modal
      fireEvent.click(screen.getByText("Tutup"));

      // Verify modal is closed
      await waitFor(() => {
        expect(screen.queryByText("Filter Alat Medis")).not.toBeInTheDocument();
      });
    });

    it("resets filters when reset button is clicked", async () => {
      render(<MedicalEquipmentPage />);

      await waitFor(() => {
        expect(screen.queryByText("Memuat Alat Medis...")).not.toBeInTheDocument();
      });

      // Open filter modal
      fireEvent.click(screen.getByText("Filter"));

      // Select Active status
      fireEvent.click(screen.getByLabelText("Active"));

      // Reset filters
      fireEvent.click(screen.getByText("Reset"));

      // Apply empty filters
      fireEvent.click(screen.getByText("Terapkan"));

      // Verify fetch was called without status parameter
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.not.stringContaining("status="),
          expect.any(Object)
        );
      });
    });
  });

  // Negative Test Cases
  describe("Negative test cases", () => {
    it("shows error toast when delete request fails", async () => {
      // Mock confirmation dialog to return true
      (global.confirm as jest.Mock).mockReturnValue(true);

      // Mock delete response to fail
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: "Failed to delete" }),
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

    it("doesn't delete when user cancels confirmation", async () => {
      // Mock confirmation dialog to return false
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

    it("handles empty equipment list", async () => {
      // Mock empty response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      render(<MedicalEquipmentPage />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText("Tidak ada alat medis yang ditemukan")).toBeInTheDocument();
      });
    });

    it("handles API fetch errors", async () => {
      // Mock fetch error
      console.error = jest.fn(); // Suppress console error in test
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"));

      render(<MedicalEquipmentPage />);

      // Wait for request to finish
      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
        expect(screen.queryByText("Memuat Alat Medis...")).not.toBeInTheDocument();
      });
    });

    it("shows message when search returns no results", async () => {
      // Initially load data
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockMedicalEquipments),
      });

      // Then return empty results for search
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      render(<MedicalEquipmentPage />);

      await waitFor(() => {
        expect(screen.queryByText("Memuat Alat Medis...")).not.toBeInTheDocument();
      });

      // Search for something
      const searchInput = screen.getByTestId("search-input");
      fireEvent.change(searchInput, { target: { value: "doesnotexist" } });

      // Verify no results message includes search context
      await waitFor(() => {
        expect(screen.getByText("Tidak ada alat medis yang cocok dengan pencarian Anda")).toBeInTheDocument();
      });
    });

    it("shows error toast when fetch request fails with error message", async () => {
      // Mock fetch failure with error message
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: "Authentication failed" }),
      });

      render(<MedicalEquipmentPage />);

      // Verify error toast
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Authentication failed");
      });
    });

    it("shows generic error toast when fetch request fails without message", async () => {
      // Mock fetch failure without error message
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValue({}),
      });

      render(<MedicalEquipmentPage />);

      // Verify error toast
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Gagal memuat data alat medis");
      });
    });

    it("handles token not found", async () => {
      // Mock no token
      (Cookies.get as jest.Mock).mockReturnValue(null);

      render(<MedicalEquipmentPage />);

      // Verify redirect to login
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  // Corner Test Cases
  describe("Corner test cases", () => {
    it("formats null or missing data correctly", async () => {
      render(<MedicalEquipmentPage />);

      await waitFor(() => {
        expect(screen.getByTestId("equipment-row-2")).toBeInTheDocument();
      });

      // Check null price is displayed as "-"
      const cells = screen.getAllByRole("cell");
      const priceCell = Array.from(cells).find(cell => cell.textContent === "-");
      expect(priceCell).toBeInTheDocument();

      // Check null date is displayed as "-"
      const dateCell = Array.from(cells).find(cell => cell.textContent === "-");
      expect(dateCell).toBeInTheDocument();
    });

    it("applies different status classes based on status value", async () => {
      render(<MedicalEquipmentPage />);

      await waitFor(() => {
        expect(screen.getAllByText("Active")[0]).toBeInTheDocument();
        expect(screen.getAllByText("Inactive")[0]).toBeInTheDocument();
        expect(screen.getAllByText("Maintenance")[0]).toBeInTheDocument();
      });

      // Check active status has green class
      const activeStatus = screen.getAllByText("Active")[0];
      expect(activeStatus.className).toContain("bg-green-100");
      expect(activeStatus.className).toContain("text-green-800");

      // Check inactive status has red class
      const inactiveStatus = screen.getAllByText("Inactive")[0];
      expect(inactiveStatus.className).toContain("bg-red-100");
      expect(inactiveStatus.className).toContain("text-red-800");

      // Check maintenance status has yellow class
      const maintenanceStatus = screen.getAllByText("Maintenance")[0];
      expect(maintenanceStatus.className).toContain("bg-yellow-100");
      expect(maintenanceStatus.className).toContain("text-yellow-800");
    });

    it("handles invalid date formats gracefully", async () => {
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

      console.error = jest.fn(); // Suppress console error

      render(<MedicalEquipmentPage />);

      await waitFor(() => {
        expect(screen.getByTestId("equipment-row-1")).toBeInTheDocument();
      });

      // Verify the invalid date is displayed as-is
      expect(screen.getByText("invalid-date")).toBeInTheDocument();
      expect(console.error).toHaveBeenCalled();
    });

    it("handles success=delete URL parameter", async () => {
      mockSearchParamsGet.mockImplementation((key) => {
        if (key === "success") return "delete";
        return null;
      });

      render(<MedicalEquipmentPage />);

      // Wait for useEffect to run
      await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith("Alat medis berhasil dihapus");
      });
    });

    it("e.stopPropagation on action buttons prevents row click", async () => {
      render(<MedicalEquipmentPage />);

      await waitFor(() => {
        expect(screen.getByTestId("equipment-row-1")).toBeInTheDocument();
      });

      // Create a mock event with stopPropagation
      const mockEvent = {
        stopPropagation: jest.fn(),
      };

      // Mock click on action cell
      const actionCell = screen.getAllByRole("cell").find(
        cell => cell.className.includes("text-right")
      );

      // Simulate a MouseEvent on the action cell that should call stopPropagation
      fireEvent.click(actionCell as HTMLElement, mockEvent);

      // Verify that stopPropagation was called
      // This is checking the internal behavior, we know it works if the router.push wasn't called
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("handles unknown status color correctly", async () => {
      // Mock equipment with unknown status
      const mockUnknownStatusEquipment = [
        {
          ...mockMedicalEquipments[0],
          status: "Unknown",
        },
      ];

      // Mock response with unknown status
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUnknownStatusEquipment),
      });

      render(<MedicalEquipmentPage />);

      await waitFor(() => {
        expect(screen.getByTestId("equipment-row-1")).toBeInTheDocument();
      });

      // Check unknown status has default class
      const unknownStatus = screen.getByText("Unknown");
      expect(unknownStatus.className).toContain("bg-gray-100");
      expect(unknownStatus.className).toContain("text-gray-800");
    });

    it("formats price correctly with currency", async () => {
      render(<MedicalEquipmentPage />);

      await waitFor(() => {
        expect(screen.getByTestId("equipment-row-1")).toBeInTheDocument();
      });

      // Verify price is formatted correctly (assuming IDR format)
      expect(screen.getByText("Rp 1.000.000")).toBeInTheDocument();
    });

    it("formats date correctly in Indonesian format", async () => {
      render(<MedicalEquipmentPage />);

      await waitFor(() => {
        expect(screen.getByTestId("equipment-row-1")).toBeInTheDocument();
      });

      // Verify date is formatted correctly (assuming Indonesian format)
      expect(screen.getByText("01/01/2023")).toBeInTheDocument();
    });

    it("handles filter by multiple statuses", async () => {
      render(<MedicalEquipmentPage />);

      await waitFor(() => {
        expect(screen.queryByText("Memuat Alat Medis...")).not.toBeInTheDocument();
      });

      // Open filter modal
      fireEvent.click(screen.getByText("Filter"));

      // Select multiple statuses
      fireEvent.click(screen.getByLabelText("Active"));
      fireEvent.click(screen.getByLabelText("Maintenance"));

      // Apply filters
      fireEvent.click(screen.getByText("Terapkan"));

      // Verify fetch was called with multiple status parameters
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringMatching(/status=Active.*status=Maintenance|status=Maintenance.*status=Active/),
          expect.any(Object)
        );
      });
    });

    it("handles pagination correctly", async () => {
      render(<MedicalEquipmentPage />);

      await waitFor(() => {
        expect(screen.queryByText("Memuat Alat Medis...")).not.toBeInTheDocument();
      });

      // Clear previous fetch calls
      (global.fetch as jest.Mock).mockClear();

      // Click on next page button (assuming it has a test id)
      fireEvent.click(screen.getByTestId("next-page"));

      // Verify fetch was called with page parameter
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("page=2"),
          expect.any(Object)
        );
      });
    });

    it("handles changing items per page", async () => {
      render(<MedicalEquipmentPage />);

      await waitFor(() => {
        expect(screen.queryByText("Memuat Alat Medis...")).not.toBeInTheDocument();
      });

      // Clear previous fetch calls
      (global.fetch as jest.Mock).mockClear();

      // Change items per page dropdown (assuming it has a test id)
      fireEvent.change(screen.getByTestId("items-per-page"), { target: { value: "25" } });

      // Verify fetch was called with limit parameter
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("limit=25"),
          expect.any(Object)
        );
      });
    });

    it("handles filter by date range correctly", async () => {
      render(<MedicalEquipmentPage />);

      await waitFor(() => {
        expect(screen.queryByText("Memuat Alat Medis...")).not.toBeInTheDocument();
      });

      // Open filter modal
      fireEvent.click(screen.getByText("Filter"));

      // Enter date range
      fireEvent.change(screen.getByTestId("start-date"), {
        target: { value: "2023-01-01" }
      });
      fireEvent.change(screen.getByTestId("end-date"), {
        target: { value: "2023-12-31" }
      });

      // Apply filters
      fireEvent.click(screen.getByText("Terapkan"));

      // Verify fetch was called with date parameters
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("startDate=2023-01-01"),
          expect.any(Object)
        );
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("endDate=2023-12-31"),
          expect.any(Object)
        );
      });
    });

    it("handles sorting when clicking column headers", async () => {
      render(<MedicalEquipmentPage />);

      await waitFor(() => {
        expect(screen.queryByText("Memuat Alat Medis...")).not.toBeInTheDocument();
      });

      // Clear previous fetch calls
      (global.fetch as jest.Mock).mockClear();

      // Click on name column header to sort
      fireEvent.click(screen.getByText("Nama"));

      // Verify fetch was called with sort parameters
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("sortBy=name"),
          expect.any(Object)
        );
      });

      // Click again to change sort direction
      fireEvent.click(screen.getByText("Nama"));

      // Verify fetch was called with different sort direction
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("sortDir=desc"),
          expect.any(Object)
        );
      });
    });

    it("debounces search input correctly", async () => {
      jest.useFakeTimers();

      render(<MedicalEquipmentPage />);

      await waitFor(() => {
        expect(screen.queryByText("Memuat Alat Medis...")).not.toBeInTheDocument();
      });

      // Clear previous fetch calls
      (global.fetch as jest.Mock).mockClear();

      // Type search term
      const searchInput = screen.getByTestId("search-input");
      fireEvent.change(searchInput, { target: { value: "Equipment" } });

      // Check that fetch is not called immediately
      expect(global.fetch).not.toHaveBeenCalled();

      // Fast-forward debounce time
      jest.advanceTimersByTime(500);

      // Verify fetch was called with search parameter
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("search=Equipment"),
        expect.any(Object)
      );

      jest.useRealTimers();
    });

    it("handles unknown success parameter type gracefully", async () => {
      mockSearchParamsGet.mockImplementation((key) => {
        if (key === "success") return "unknown";
        return null;
      });

      render(<MedicalEquipmentPage />);

      // Wait for component to render
      await waitFor(() => {
        expect(screen.queryByText("Memuat Alat Medis...")).not.toBeInTheDocument();
      });

      // Verify that no toast was shown for unknown success type
      expect(toast.info).not.toHaveBeenCalled();
    });
  });
});