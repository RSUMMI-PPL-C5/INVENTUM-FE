import { useRouter } from "next/navigation";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserCreate from "../../../../../src/modules/user/user-create";
import Cookies from "js-cookie";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock Cookies
jest.mock("js-cookie", () => ({
  get: jest.fn(),
}));

// Mock global functions
global.alert = jest.fn();
global.confirm = jest.fn();
global.fetch = jest.fn();
global.console.error = jest.fn();
global.console.log = jest.fn();

const mockFetchWithDelay = () => {
  const mockFetchResponse = () => ({ ok: true, json: async () => ({ id: 1 }) });

  (global.fetch as jest.Mock).mockImplementationOnce(() =>
    new Promise((resolve) => setTimeout(() => resolve(mockFetchResponse()), 100))
  );
};

// Helper function to fill in required fields
const fillRequiredFields = () => {
  fireEvent.change(screen.getByLabelText(/No. Karyawan/i), { target: { value: "12345" } });
  fireEvent.change(screen.getByLabelText(/Nama Lengkap/i), { target: { value: "John Doe" } });
  fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "johndoe" } });
  fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "johndoe@example.com" } });
  fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });
  fireEvent.click(screen.getByText("Pilih Divisi"));
  fireEvent.click(screen.getByRole("option", { name: "IT Division" }));
  fireEvent.click(screen.getByText("Pilih Role"));
  fireEvent.click(screen.getByRole("option", { name: "Admin" }));
  fireEvent.click(screen.getByText("Pilih tanggal"));
  fireEvent.click(screen.getByText("15")); // Select a date from the calendar
};

// Helper function to mock fetch behavior
const mockFetch = (response: any, ok = true) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok,
    json: async () => response,
  });
};

// Helper function to render the component and set up mocks
const setupMocks = (mockPush: jest.Mock) => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  (global.confirm as jest.Mock).mockImplementation(() => true);
  (Cookies.get as jest.Mock).mockReturnValue("mock-token");
  jest.spyOn(global.Date, "now").mockImplementation(() => new Date("2025-03-14T17:00:00.000Z").getTime());
};

describe("UserCreate Component", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    setupMocks(mockPush);
  });

  it("renders the component correctly", () => {
    render(<UserCreate />);

    expect(screen.getByText("Tambah Pengguna")).toBeInTheDocument();
    expect(screen.getByLabelText(/No. Karyawan/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nama Lengkap/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/No. WA/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByText("Divisi")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Tanggal Masuk")).toBeInTheDocument();
  });

  it("calls createUser with correct data and handles success", async () => {
    mockFetch({ id: 1, username: "testuser" });

    render(<UserCreate />);
    fillRequiredFields();

    fireEvent.click(screen.getByText("Simpan"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/user/`,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer mock-token",
          }),
          body: JSON.stringify({
            username: "johndoe",
            email: "johndoe@example.com",
            password: "password123",
            role: "Admin",
            fullname: "John Doe",
            nokar: "12345",
            divisiId: 4, // IT Division ID
            waNumber: null,
            createdBy: 1,
            createdOn: "2025-03-14T17:00:00.000Z",
          }),
        })
      );
    });
  });

  it("handles missing authorization token and sends request without Authorization header", async () => {
    (Cookies.get as jest.Mock).mockReturnValue(null);
    mockFetch({ id: 1, username: "testuser" });

    render(<UserCreate />);
    fillRequiredFields();

    fireEvent.click(screen.getByText("Simpan"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/user/`,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "", // Authorization header should be an empty string
          }),
        })
      );
    });
  });

  it("handles onSubmit success and navigates to the user list", async () => {
    mockFetch({ id: 1, username: "testuser" });

    render(<UserCreate />);
    fillRequiredFields();

    fireEvent.click(screen.getByText("Simpan"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard/user?success=create");
    });
  });

  it("handles onSubmit failure and sets error message", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Failed to create user"));

    render(<UserCreate />);
    fillRequiredFields();

    fireEvent.click(screen.getByText("Simpan"));

    await waitFor(() => {
      expect(screen.getByText("Gagal membuat pengguna. Silakan coba lagi.")).toBeInTheDocument();
    });
  });

  it("handles API failure and throws an error", async () => {
    mockFetch({ message: "Bad Request" }, false);

    render(<UserCreate />);
    fillRequiredFields();

    fireEvent.click(screen.getByText("Simpan"));

    await waitFor(() => {
      expect(screen.getByText("Gagal membuat pengguna. Silakan coba lagi.")).toBeInTheDocument();
    });
  });

  it("calls router.back() when 'Batalkan' button is clicked", () => {
    const mockBack = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ back: mockBack });

    render(<UserCreate />);

    fireEvent.click(screen.getByText("Batalkan"));

    expect(mockBack).toHaveBeenCalled();
  });

  it("disables 'Simpan' button when loading is true", async () => {
    mockFetchWithDelay();
  
    render(<UserCreate />);
    fillRequiredFields();

    fireEvent.click(screen.getByText("Simpan"));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Menyimpan.../i })).toBeDisabled();
    });
  });
});