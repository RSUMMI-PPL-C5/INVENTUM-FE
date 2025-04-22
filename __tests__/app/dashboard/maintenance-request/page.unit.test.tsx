import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import MaintenanceRequestDisplay from "@/app/dashboard/maintenance-request/page";
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

describe("MaintenanceRequestDisplay", () => {
  // Sample data for testing
  const mockMaintenanceRequests = [
    {
      id: "1",
      userId: "user-001",
      medicalEquipment: "INV-001",
      complaint: "Peralatan tidak berfungsi dengan baik",
      submissionDate: "2023-01-01",
      status: "Pending",
      createdBy: 1,
      createdOn: "2023-01-01",
      modifiedBy: 1,
      modifiedOn: "2023-01-01",
    },
    {
      id: "2",
      userId: "user-002",
      medicalEquipment: "INV-002",
      complaint: null,
      submissionDate: "2023-02-01",
      status: "On Progress",
      createdBy: 2,
      createdOn: null,
      modifiedBy: 2,
      modifiedOn: "2023-02-02",
    },
    {
      id: "3",
      userId: "user-003",
      medicalEquipment: "INV-003",
      complaint: "Membutuhkan kalibrasi rutin",
      submissionDate: "2023-03-01",
      status: "Completed",
      createdBy: 3,
      createdOn: "2023-03-01",
      modifiedBy: 3,
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
      json: jest.fn().mockResolvedValue(mockMaintenanceRequests),
    });
  });

  // Positive Test Cases
  describe("Positive test cases", () => {
    it("renders the maintenance request page with data", async () => {
      render(<MaintenanceRequestDisplay />);
      
      // Check loading state is shown initially
      expect(screen.getByText("Memuat Permintaan Pemeliharaan...")).toBeInTheDocument();
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText("INV-001")).toBeInTheDocument();
        expect(screen.getByText("INV-002")).toBeInTheDocument();
        expect(screen.getByText("INV-003")).toBeInTheDocument();
      });
      
      // Check headers are rendered
      expect(screen.getByText("Kode Inventaris")).toBeInTheDocument();
      expect(screen.getByText("Nama Alat")).toBeInTheDocument();
      expect(screen.getByText("Catatan")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Aksi")).toBeInTheDocument();
    });

    it("allows searching for maintenance requests", async () => {
      render(<MaintenanceRequestDisplay />);
      
      await waitFor(() => {
        expect(screen.getByText("INV-001")).toBeInTheDocument();
      });
      
      // Clear previous fetch calls
      (global.fetch as jest.Mock).mockClear();
      
      // Enter search term
      const searchInput = screen.getByTestId("search-input");
      fireEvent.change(searchInput, { target: { value: "kalibrasi" } });
      
      // Verify fetch was called with search parameter
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("search=kalibrasi"),
          expect.any(Object)
        );
      });
    });

    it("opens filter modal when filter button is clicked", async () => {
      render(<MaintenanceRequestDisplay />);
      
      await waitFor(() => {
        expect(screen.queryByText("Memuat Permintaan Pemeliharaan...")).not.toBeInTheDocument();
      });
      
      // Click filter button
      fireEvent.click(screen.getByText("Filter"));
      
      // Check if filter modal is open
      expect(screen.getByText("Filter Permintaan Pemeliharaan")).toBeInTheDocument();
    });

    it("applies filters and fetches filtered data", async () => {
      render(<MaintenanceRequestDisplay />);
      
      await waitFor(() => {
        expect(screen.queryByText("Memuat Permintaan Pemeliharaan...")).not.toBeInTheDocument();
      });
      
      // Open filter modal
      fireEvent.click(screen.getByText("Filter"));
      
      // Select Completed status
      fireEvent.click(screen.getByLabelText("Completed"));
      
      // Apply filters
      fireEvent.click(screen.getByText("Terapkan"));
      
      // Verify fetch was called with status parameter
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("status=Completed"),
          expect.any(Object)
        );
      });
    });

    it("navigates to request detail when row is clicked", async () => {
      render(<MaintenanceRequestDisplay />);
      
      await waitFor(() => {
        expect(screen.getByTestId("request-row-1")).toBeInTheDocument();
      });
      
      // Click on a row
      fireEvent.click(screen.getByTestId("request-row-1"));
      
      // Verify navigation
      expect(mockPush).toHaveBeenCalledWith("/dashboard/maintenance-requests/1");
    });

    it("navigates to request edit page when edit button is clicked", async () => {
      render(<MaintenanceRequestDisplay />);
      
      await waitFor(() => {
        expect(screen.getByTestId("edit-button-1")).toBeInTheDocument();
      });
      
      // Click edit button
      fireEvent.click(screen.getByTestId("edit-button-1"));
      
      // Verify navigation
      expect(mockPush).toHaveBeenCalledWith("/dashboard/maintenance-requests/1/edit");
    });

    it("navigates to request create page when add button is clicked", async () => {
      render(<MaintenanceRequestDisplay />);
      
      await waitFor(() => {
        expect(screen.queryByText("Memuat Permintaan Pemeliharaan...")).not.toBeInTheDocument();
      });
      
      // Click add button
      fireEvent.click(screen.getByText("Tambah Permintaan"));
      
      // Verify navigation
      expect(mockPush).toHaveBeenCalledWith("/dashboard/maintenance-requests/create");
    });

    it("deletes request when delete button is clicked and confirmed", async () => {
      // Mock confirmation dialog to return true
      (global.confirm as jest.Mock).mockReturnValue(true);
      
      // Mock delete response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });
      
      render(<MaintenanceRequestDisplay />);
      
      await waitFor(() => {
        expect(screen.getByTestId("delete-button-1")).toBeInTheDocument();
      });
      
      // Click delete button
      fireEvent.click(screen.getByTestId("delete-button-1"));
      
      // Verify confirmation dialog
      expect(global.confirm).toHaveBeenCalledWith("Apakah Anda yakin ingin menghapus permintaan pemeliharaan ini?");
      
      // Verify delete API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/maintenance-requests/1"),
          expect.objectContaining({ method: "DELETE" })
        );
      });
      
      // Verify success toast
      expect(toast.info).toHaveBeenCalledWith("Permintaan pemeliharaan berhasil dihapus");
    });

    it("shows success toast when URL has success parameter", async () => {
      mockSearchParamsGet.mockImplementation((key) => {
        if (key === "success") return "create";
        return null;
      });
      
      render(<MaintenanceRequestDisplay />);
      
      // Wait for useEffect to run
      await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith("Permintaan pemeliharaan berhasil dibuat");
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
      
      render(<MaintenanceRequestDisplay />);
      
      await waitFor(() => {
        expect(screen.getByTestId("delete-button-1")).toBeInTheDocument();
      });
      
      // Click delete button
      fireEvent.click(screen.getByTestId("delete-button-1"));
      
      // Verify error toast
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Gagal menghapus permintaan pemeliharaan");
      });
    });

    it("doesn't delete when user cancels confirmation", async () => {
      // Mock confirmation dialog to return false
      (global.confirm as jest.Mock).mockReturnValue(false);
      
      render(<MaintenanceRequestDisplay />);
      
      await waitFor(() => {
        expect(screen.getByTestId("delete-button-1")).toBeInTheDocument();
      });
      
      // Click delete button
      fireEvent.click(screen.getByTestId("delete-button-1"));
      
      // Verify delete API was not called
      expect(global.fetch).not.toHaveBeenCalledWith(
        expect.stringContaining("/maintenance-requests/1"),
        expect.objectContaining({ method: "DELETE" })
      );
    });

    it("handles empty request list", async () => {
      // Mock empty response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });
      
      render(<MaintenanceRequestDisplay />);
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText("Tidak ada permintaan pemeliharaan yang ditemukan")).toBeInTheDocument();
      });
    });

    it("handles API fetch errors", async () => {
      // Mock fetch error
      console.error = jest.fn(); // Suppress console error in test
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"));
      
      render(<MaintenanceRequestDisplay />);
      
      // Wait for request to finish
      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith("Gagal memuat permintaan pemeliharaan");
        expect(screen.queryByText("Memuat Permintaan Pemeliharaan...")).not.toBeInTheDocument();
      });
    });

    it("shows message when search returns no results", async () => {
      // Initially load data
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockMaintenanceRequests),
      });
      
      // Then return empty results for search
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });
      
      render(<MaintenanceRequestDisplay />);
      
      await waitFor(() => {
        expect(screen.queryByText("Memuat Permintaan Pemeliharaan...")).not.toBeInTheDocument();
      });
      
      // Search for something
      const searchInput = screen.getByTestId("search-input");
      fireEvent.change(searchInput, { target: { value: "doesnotexist" } });
      
      // Verify no results message includes search context
      await waitFor(() => {
        expect(screen.getByText("Tidak ada permintaan pemeliharaan yang cocok dengan pencarian Anda")).toBeInTheDocument();
      });
    });
  });

  // Corner Test Cases
  describe("Corner test cases", () => {
    it("formats null or missing complaint correctly", async () => {
      render(<MaintenanceRequestDisplay />);
      
      await waitFor(() => {
        expect(screen.getByTestId("request-row-2")).toBeInTheDocument();
      });
      
      // Check null complaint is displayed as "-"
      const cells = screen.getAllByRole("cell");
      const complaintCell = Array.from(cells).find(cell => cell.textContent === "-");
      expect(complaintCell).toBeInTheDocument();
    });

    it("applies different status classes based on status value", async () => {
      render(<MaintenanceRequestDisplay />);
      
      await waitFor(() => {
        expect(screen.getAllByText("Pending")[0]).toBeInTheDocument();
        expect(screen.getAllByText("On Progress")[0]).toBeInTheDocument();
        expect(screen.getAllByText("Completed")[0]).toBeInTheDocument();
      });
      
      // Check completed status has green class
      const completedStatus = screen.getAllByText("Completed")[0];
      expect(completedStatus.className).toContain("bg-green-100");
      expect(completedStatus.className).toContain("text-green-800");
      
      // Check pending status has blue class
      const pendingStatus = screen.getAllByText("Pending")[0];
      expect(pendingStatus.className).toContain("bg-blue-100");
      expect(pendingStatus.className).toContain("text-blue-800");
      
      // Check on progress status has yellow class
      const onProgressStatus = screen.getAllByText("On Progress")[0];
      expect(onProgressStatus.className).toContain("bg-yellow-100");
      expect(onProgressStatus.className).toContain("text-yellow-800");
    });

    it("truncates long complaint text", async () => {
      // Create a mock with a very long complaint
      const longComplaintRequest = [
        {
          ...mockMaintenanceRequests[0],
          complaint: "This is a very long complaint that should be truncated in the UI because it exceeds the maximum width allowed for this field and would otherwise break the layout of the table by making this cell too wide.",
        },
      ];
      
      // Mock response with long complaint
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(longComplaintRequest),
      });
      
      render(<MaintenanceRequestDisplay />);
      
      await waitFor(() => {
        expect(screen.getByTestId("request-row-1")).toBeInTheDocument();
      });
      
      // Verify truncation container exists
      const truncateContainer = screen.getByText(longComplaintRequest[0].complaint);
      expect(truncateContainer.className).toContain("truncate");
    });

    it("handles success=delete URL parameter", async () => {
      mockSearchParamsGet.mockImplementation((key) => {
        if (key === "success") return "delete";
        return null;
      });
      
      render(<MaintenanceRequestDisplay />);
      
      // Wait for useEffect to run
      await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith("Permintaan pemeliharaan berhasil dihapus");
      });
    });

    it("e.stopPropagation on action buttons prevents row click", async () => {
      render(<MaintenanceRequestDisplay />);
      
      await waitFor(() => {
        expect(screen.getByTestId("request-row-1")).toBeInTheDocument();
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
  });
});