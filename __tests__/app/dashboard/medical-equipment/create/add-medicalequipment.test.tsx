import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MedicalEquipmentCreate from "@/app/dashboard/medical-equipment/create/page";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

// ✅ Mock useRouter dari Next.js
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// ✅ Mock Cookies untuk token autentikasi
jest.mock("js-cookie", () => ({
  get: jest.fn(),
}));

describe("MedicalEquipmentCreate Component", () => {
  let mockRouterPush: jest.Mock;

  beforeEach(() => {
    mockRouterPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
      back: jest.fn()  // Add mock for router.back() if used
    });

    // Mock authentication token
    (Cookies.get as jest.Mock).mockImplementation((key) => {
      if (key === 'token') return 'fake-auth-token';
      return null;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully submit form and redirect", async () => {
    // Mock fetch with more complete response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "Success" }),
        status: 200
      })
    ) as jest.Mock;

    render(<MedicalEquipmentCreate />);

    // More reliable way to select form elements
    const inventoryIdInput = screen.getByPlaceholderText("Masukkan Inventoris ID");
    const nameInput = screen.getByPlaceholderText("Masukkan nama alat medis");
    const brandInput = screen.getByPlaceholderText("Masukkan merk (opsional)");
    const modelInput = screen.getByPlaceholderText("Masukkan model (opsional)");

    // Fill form inputs
    fireEvent.change(inventoryIdInput, { target: { value: "INV-001" } });
    fireEvent.change(nameInput, { target: { value: "X-Ray Machine" } });
    fireEvent.change(brandInput, { target: { value: "MedCorp" } });
    fireEvent.change(modelInput, { target: { value: "XR-2000" } });

    // Correctly handle dropdown selection
    const statusDropdown = screen.getByText("Pilih Status");
    fireEvent.mouseDown(statusDropdown);

    // Wait for dropdown options to appear
    const activeOption = await screen.findByText("Active");
    fireEvent.click(activeOption);

    // Submit form
    const submitButton = screen.getByText("Simpan");
    fireEvent.click(submitButton);

    // More robust waiting with timeout
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/dashboard/medicalequipment?success=create");
    }, { timeout: 2000 });
  });

  it("should show error if API request fails", async () => {
    // Mock fetch with more detailed error response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: "Server error" })
      })
    ) as jest.Mock;

    render(<MedicalEquipmentCreate />);

    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText("Masukkan Inventoris ID"), { target: { value: "INV-002" } });
    fireEvent.change(screen.getByPlaceholderText("Masukkan nama alat medis"), { target: { value: "MRI Scanner" } });

    // Select status (required field)
    const statusDropdown = screen.getByText("Pilih Status");
    fireEvent.mouseDown(statusDropdown);
    const activeOption = await screen.findByText("Active");
    fireEvent.click(activeOption);

    // Submit the form
    const submitButton = screen.getByText("Simpan");
    fireEvent.click(submitButton);

    // Check for error message with longer timeout
    await waitFor(() => {
      expect(screen.getByText("Gagal menambahkan alat medis. Silakan coba lagi.")).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  /** 🛑 Corner Case: Validasi form gagal */
  it("should show validation errors if form fields are empty", async () => {
    render(<MedicalEquipmentCreate />);

    // Klik submit tanpa mengisi form
    fireEvent.click(screen.getByText("Simpan"));

    // Pastikan validasi error muncul
    await waitFor(() => {
      expect(screen.getByText("Inventoris ID wajib diisi")).toBeInTheDocument();
      expect(screen.getByText("Nama alat wajib diisi")).toBeInTheDocument();
      expect(screen.getByText("Status wajib diisi")).toBeInTheDocument();
    });
  });

  /** ✅ Positive Case: Pembatalan form */
  it("should go back when 'Batalkan' is clicked", () => {
    render(<MedicalEquipmentCreate />);

    fireEvent.click(screen.getByText("Batalkan"));

    expect(mockRouterPush).toHaveBeenCalledTimes(1);
  });
});
