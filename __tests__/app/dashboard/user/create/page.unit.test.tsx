import { useRouter } from "next/navigation";
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
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

// Mock scrollIntoView method which is used by date picker components
Element.prototype.scrollIntoView = jest.fn();

// Mock divisions data
const mockDivisions = [
  { id: 1, divisi: "HR Division" },
  { id: 2, divisi: "IT Division" },
  { id: 3, divisi: "Marketing Division" }
];

// Helper function to fill in required fields with mocked divisions
const fillRequiredFields = async () => {
  fireEvent.change(screen.getByLabelText(/No. Karyawan/i), { target: { value: "12345" } });
  fireEvent.change(screen.getByLabelText(/Nama Lengkap/i), { target: { value: "John Doe" } });
  fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "johndoe" } });
  fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "johndoe@example.com" } });
  fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });
  fireEvent.change(screen.getByLabelText(/No. WA/i), { target: { value: "08123456789" } });
  
  // Handle division selection
  fireEvent.click(screen.getByText("Pilih Divisi"));
  await waitFor(() => {
    expect(screen.getByRole("option", { name: "IT Division" })).toBeInTheDocument();
  });
  fireEvent.click(screen.getByRole("option", { name: "IT Division" }));
  
  // Handle role selection
  fireEvent.click(screen.getByText("Pilih Role"));
  fireEvent.click(screen.getByRole("option", { name: "Admin" }));
  
  // Handle date selection
  fireEvent.click(screen.getByText("Pilih tanggal"));
  // Wait for calendar to appear and then use a more robust selector
  await waitFor(() => {
    const dateElements = screen.getAllByText("15");
    // Click the first matching date element that's visible
    if (dateElements.length > 0) {
      fireEvent.click(dateElements[0]);
    }
  });
};

describe("UserCreate Component", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (global.confirm as jest.Mock).mockImplementation(() => true);
    (Cookies.get as jest.Mock).mockReturnValue("mock-token");
    jest.spyOn(global.Date, "now").mockImplementation(() => new Date("2025-03-14T17:00:00.000Z").getTime());
  
    (global.fetch as jest.Mock).mockImplementation((url: string, options: any) => {
      // Handle division endpoint
      if (url.includes('/divisi/all')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockDivisions
        });
      }
      
      // Handle user creation endpoint
      if (url.includes('/user/') && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: 1, username: "testuser" })
        });
      }
      
      return Promise.reject(new Error(`Unhandled request: ${url}`));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the component correctly", async () => {
    await act(async () => {
      render(<UserCreate />);
    });

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
    await act(async () => {
      render(<UserCreate />);
    });
    
    await fillRequiredFields();

    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/user/`,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer mock-token",
          }),
          body: expect.stringContaining('"divisiId":2') // Now expecting ID 2 for "IT Division"
        })
      );
    });
  });

  it("handles missing authorization token and sends request without Authorization header", async () => {
    (Cookies.get as jest.Mock).mockReturnValue(null);
    
    await act(async () => {
      render(<UserCreate />);
    });
    
    await fillRequiredFields();

    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));

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
    await act(async () => {
      render(<UserCreate />);
    });
    
    await fillRequiredFields();

    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard/user?success=create");
    });
  });

  it("handles onSubmit failure and sets error message", async () => {
    // Override the fetch mock for user creation to fail
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/divisi/all')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockDivisions
        });
      }
      return Promise.reject(new Error("Failed to create user"));
    });

    await act(async () => {
      render(<UserCreate />);
    });
    
    await fillRequiredFields();

    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => {
      expect(screen.getByText("Gagal membuat pengguna. Silakan coba lagi.")).toBeInTheDocument();
    });
  });

  it("handles API failure and throws an error", async () => {
    // Override the fetch mock for user creation to return a non-ok response
    (global.fetch as jest.Mock).mockImplementation((url: string, options: any) => {
      if (url.includes('/divisi/all')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockDivisions
        });
      }
      if (url.includes('/user/') && options.method === 'POST') {
        return Promise.resolve({
          ok: false,
          json: async () => ({ message: "Bad Request" })
        });
      }
      return Promise.reject(new Error(`Unhandled request: ${url}`));
    });

    await act(async () => {
      render(<UserCreate />);
    });
    
    await fillRequiredFields();

    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => {
      expect(screen.getByText("Gagal membuat pengguna. Silakan coba lagi.")).toBeInTheDocument();
    });
  });

  it("calls router.back() when 'Batalkan' button is clicked", async () => {
    const mockBack = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ back: mockBack });

    await act(async () => {
      render(<UserCreate />);
    });

    fireEvent.click(screen.getByText("Batalkan"));

    expect(mockBack).toHaveBeenCalled();
  });

  it("calls router.push() when 'Kembali' button is clicked", async () => {
    
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    await act(async () => {
      render(<UserCreate />);
    });

    fireEvent.click(screen.getByText("Kembali"));

    expect(mockPush).toHaveBeenCalledWith("/dashboard/user");
  });

  it("disables submit button when loading is true", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/divisi/all')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockDivisions
        });
      }
      if (url.includes('/user/')) {
        return new Promise((resolve) => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ id: 1 })
          }), 100)
        );
      }
      return Promise.reject(new Error(`Unhandled request: ${url}`));
    });
  
    await act(async () => {
      render(<UserCreate />);
    });
    
    await fillRequiredFields();

    const submitButton = screen.getByRole("button", { name: "Simpan" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it("shows error modal when divisions fetch fails", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/divisi/all')) {
        return Promise.reject(new Error("Failed to fetch divisions"));
      }
      return Promise.reject(new Error(`Unhandled request: ${url}`));
    });

    await act(async () => {
      render(<UserCreate />);
    });

    await waitFor(() => {
      expect(screen.getByText("Failed to load parent divisions.")).toBeInTheDocument();
    });
  });

  it("closes error modal when clicking the close button", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/divisi/all')) {
        return Promise.reject(new Error("Failed to fetch divisions"));
      }
      return Promise.reject(new Error(`Unhandled request: ${url}`));
    });

    await act(async () => {
      render(<UserCreate />);
    });

    await waitFor(() => {
      expect(screen.getByText("Failed to load parent divisions.")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle("Close"));

    await waitFor(() => {
      expect(screen.queryByText("Failed to load parent divisions.")).not.toBeInTheDocument();
    });
  });
});