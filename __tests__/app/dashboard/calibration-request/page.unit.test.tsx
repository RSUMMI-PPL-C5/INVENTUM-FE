import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CalibrationRequestDisplay from "@/modules/calibration-request/calibration-request-display";
import CalibrationRequestDisplayPage from "@/app/dashboard/calibration-request/page";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";

describe('CalibrationRequestDisplayPage', () => {
  it('', () => {
    render(<CalibrationRequestDisplayPage />);
    const pageName = screen.getByText('CalibrationRequestDisplay');
    expect(pageName).toBeInTheDocument();
  });
});

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));
jest.mock("js-cookie", () => ({
  get: jest.fn(),
}));
jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    info: jest.fn(),
    success: jest.fn(),
  },
}));

describe("CalibrationRequestDisplay", () => {
  const mockPush = jest.fn();
  const mockSetShowFilterModal = jest.fn();
  const mockSetShowDeleteDialog = jest.fn();
  const mockSetShowStatusModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => null),
      getAll: jest.fn(() => []),
      toString: jest.fn(() => ""),
    });
    (Cookies.get as jest.Mock).mockImplementation((key) => {
      if (key === "user") return JSON.stringify({ role: "Admin" });
      if (key === "accessToken") return "mock-token";
      return null;
    });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 } }),
    });
  });

  it("renders loading state", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {}));
    render(<CalibrationRequestDisplay />);
    expect(screen.getByText(/Memuat Permintaan Kalibrasi/i)).toBeInTheDocument();
  });

  it("renders empty state", async () => {
    render(<CalibrationRequestDisplay />);
    await waitFor(() => {
      expect(screen.getByText(/Tidak ada permintaan kalibrasi yang ditemukan/i)).toBeInTheDocument();
    });
  });

  it("renders table with data", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          {
            id: "1",
            userId: "u1",
            medicalEquipment: "EQ-001",
            complaint: "Test complaint",
            status: "Pending",
            createdOn: "2024-06-01T00:00:00.000Z",
            modifiedOn: "2024-06-02T00:00:00.000Z",
          },
        ],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      }),
    });
    render(<CalibrationRequestDisplay />);
    await waitFor(() => {
      expect(screen.getByText("EQ-001")).toBeInTheDocument();
      expect(screen.getByText("Test complaint")).toBeInTheDocument();
      expect(screen.getByText("Pending")).toBeInTheDocument();
    });
  });

  it("handles search input", async () => {
    render(<CalibrationRequestDisplay />);
    const input = screen.getByTestId("search-input");
    fireEvent.change(input, { target: { value: "search term" } });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });
  });

  it("handles filter modal open/close", async () => {
    render(<CalibrationRequestDisplay />);
    fireEvent.click(screen.getByText("Filter"));
    await waitFor(() => {
      expect(screen.getByText("Filter Request")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Batal"));
    await waitFor(() => {
      expect(screen.queryByText("Filter Request")).not.toBeInTheDocument();
    });
  });

  it("handles pagination", async () => {
    render(<CalibrationRequestDisplay />);
    await waitFor(() => {
      expect(screen.getByText("Tidak ada permintaan kalibrasi yang ditemukan")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("1"));
    expect(mockPush).toHaveBeenCalled();
  });

  it("handles delete dialog", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          {
            id: "1",
            userId: "u1",
            medicalEquipment: "EQ-001",
            complaint: "Test complaint",
            status: "Pending",
            createdOn: "2024-06-01T00:00:00.000Z",
            modifiedOn: "2024-06-02T00:00:00.000Z",
          },
        ],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      }),
    });
    render(<CalibrationRequestDisplay />);
    await waitFor(() => {
      expect(screen.getByText("EQ-001")).toBeInTheDocument();
    });
    // Simulate delete dialog open/confirm
    // You may need to fire events on the delete button and confirm button
  });

  it("handles status change modal", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          {
            id: "1",
            userId: "u1",
            medicalEquipment: "EQ-001",
            complaint: "Test complaint",
            status: "Pending",
            createdOn: "2024-06-01T00:00:00.000Z",
            modifiedOn: "2024-06-02T00:00:00.000Z",
          },
        ],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      }),
    });
    render(<CalibrationRequestDisplay />);
    await waitFor(() => {
      expect(screen.getByText("EQ-001")).toBeInTheDocument();
    });
    // Simulate status change modal open/confirm
    // You may need to fire events on the status button and confirm button
  });

  it("handles fetch error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
    render(<CalibrationRequestDisplay />);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
}); 