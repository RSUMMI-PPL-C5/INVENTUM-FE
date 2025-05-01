import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useRouter } from "next/navigation";
import AddDivisi from "@/app/dashboard/division/add/page";
import Cookies from "js-cookie";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock js-cookie
jest.mock("js-cookie", () => ({
  get: jest.fn(),
}));

// Mock @/hooks/use-toast
jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn().mockReturnValue({
    toast: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe("AddDivisi Component", () => {
  const mockPush = jest.fn();
  const mockBack = jest.fn();
  const mockToast = jest.fn();

  const mockDivisions = [
    {
      id: 1,
      divisi: "Operations",
      parentId: null,
      children: [
        {
          id: 3,
          divisi: "Dev Team",
          parentId: 1,
          children: [],
        },
      ],
    },
    {
      id: 2,
      divisi: "IT Department",
      parentId: null,
      children: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock router
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
    });

    // Mock cookies
    (Cookies.get as jest.Mock).mockReturnValue("mock-token");

    // Mock toast
    const useToastModule = require("@/hooks/use-toast");
    useToastModule.useToast.mockReturnValue({
      toast: mockToast,
    });

    // Mock fetch success
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockDivisions),
    });
  });

  it("renders the form correctly", async () => {
    render(<AddDivisi />);
  
    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText("Loading parent divisions...")).not.toBeInTheDocument();
      expect(screen.getByText("Tambah Divisi")).toBeInTheDocument();
      expect(screen.getByText("Nama Divisi")).toBeInTheDocument();
      expect(screen.getByText("Parent Divisi")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Masukkan nama divisi")).toBeInTheDocument();
      expect(screen.getByText("Simpan")).toBeInTheDocument();
    });
  });

  it("displays loading state while fetching parent divisions", async () => {
    // Create a delayed promise to control fetch timing
    let resolveFetch: (value: any) => void;
    const fetchPromise = new Promise(resolve => {
      resolveFetch = resolve;
    });
    
    // Mock fetch to use our controlled promise
    (global.fetch as jest.Mock).mockReturnValueOnce(fetchPromise);
    
    render(<AddDivisi />);
    
    // Verify the loading state is shown initially
    expect(screen.getByText("Loading parent divisions...")).toBeInTheDocument(); // The loading indicator
    
    // Now resolve the fetch
    resolveFetch!({
      ok: true,
      json: jest.fn().mockResolvedValue(mockDivisions)
    });
    
    // Wait for loading state to disappear
    // Wait for loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText("Loading parent divisions...")).not.toBeInTheDocument();
    });
  });

  it("fetches parent divisions on load", async () => {
    render(<AddDivisi />);
  
    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText("Loading parent divisions...")).not.toBeInTheDocument();
    });
  
    // Wait for the parent divisions to be rendered
    await waitFor(() => {
      expect(screen.getByText("Operations")).toBeInTheDocument();
      expect(screen.getByText("IT Department")).toBeInTheDocument();
    });
  
    // Assert that the fetch call was made with the correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/divisi/all",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer mock-token",
        }),
      })
    );
  });

  it("submits the form with parentId as null when 'Tidak Ada Parent' is selected", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
      if (options?.method === "POST") {
        const body = JSON.parse(options.body);
        expect(body).toEqual({
          divisi: "New Division",
          parentId: null,
        });
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDivisions),
      });
    });
  
    render(<AddDivisi />);
  
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText("Masukkan nama divisi")).toBeInTheDocument();
    });
  
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText("Masukkan nama divisi"), {
      target: { value: "New Division" },
    });
  
    // Open the dropdown
    fireEvent.click(screen.getByText("Pilih parent divisi (opsional)"));
  
    // Select "Tidak Ada Parent" using a more specific query
    const options = screen.getAllByText("Tidak Ada Parent");
    fireEvent.click(options.find((option) => option.tagName === "SPAN")!);
  
    // Submit the form
    fireEvent.click(screen.getByText("Simpan"));
  
    // Wait for the success toast
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Success",
        description: "Divisi berhasil dibuat",
      });
    });
  });

  it("submits the form successfully", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
      if (options?.method === "POST") {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDivisions),
      });
    });

    render(<AddDivisi />);

    await waitFor(() => {
      expect(screen.queryByText("Loading parent divisions...")).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText("Masukkan nama divisi")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Masukkan nama divisi"), {
      target: { value: "New Division" },
    });
    fireEvent.click(screen.getByText("Simpan"));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Success",
        description: "Divisi berhasil dibuat",
      });
      expect(mockPush).toHaveBeenCalledWith("/dashboard/division");
    });
  });

  it("handles API error when fetching divisions", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Failed to fetch"));

    render(<AddDivisi />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Failed to load parent divisions",
        variant: "destructive",
      });
    });
  });

  it("handles API error when submitting form", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
      if (options?.method === "POST") {
        return Promise.resolve({ ok: false, json: jest.fn().mockResolvedValue({ message: "Error creating division" }) });
      }
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDivisions),
      });
    });

    render(<AddDivisi />);

    await waitFor(() => {
      expect(screen.queryByText("Loading parent divisions...")).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText("Masukkan nama divisi")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Masukkan nama divisi"), {
      target: { value: "New Division" },
    });
    fireEvent.click(screen.getByText("Simpan"));

    await waitFor(() => {
      expect(screen.getByText("Gagal membuat divisi, Silahkan cek kembali nama divisi dan parent divisi yang dipilih.")).toBeInTheDocument();
    });
  });

  it("handles API error when fetching divisions", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Failed to fetch divisions"));
  
    render(<AddDivisi />);
  
    // Wait for the error toast to appear
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Failed to load parent divisions",
        variant: "destructive",
      });
    });
  });

  it("closes the error modal when the close button is clicked", async () => {
    // Setup fetch to return error response for POST requests
    (global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
      if (options?.method === "POST") {
        return Promise.resolve({ 
          ok: false, 
          json: jest.fn().mockResolvedValue({ message: "Error creating division" }) 
        });
      }
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDivisions),
      });
    });

    render(<AddDivisi />);
  
    await waitFor(() => {
      expect(screen.queryByText("Loading parent divisions...")).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText("Masukkan nama divisi")).toBeInTheDocument();
    });

    // Fill in the form to pass client-side validation
    fireEvent.change(screen.getByPlaceholderText("Masukkan nama divisi"), {
      target: { value: "New Division" },
    });
    
    // Submit the form (which will trigger the mocked failed API response)
    fireEvent.click(screen.getByText("Simpan"));
    
    // Wait for the error modal to appear
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Error")).toBeInTheDocument();
    });
    
    // Click the close button
    fireEvent.click(screen.getByText("Tutup"));
    
    // Assert that the modal is closed
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("displays loading state during form submission", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
      if (options?.method === "POST") {
        return new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100));
      }
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDivisions),
      });
    });
  
    render(<AddDivisi />);
  
    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText("Loading parent divisions...")).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText("Masukkan nama divisi")).toBeInTheDocument();
    });
  
    // Interact with the form
    fireEvent.change(screen.getByPlaceholderText("Masukkan nama divisi"), {
      target: { value: "New Division" },
    });
    fireEvent.click(screen.getByText("Simpan"));
  
    // Assert that the loading state is displayed
    await waitFor(() => {
      expect(screen.getByText("Menyimpan...")).toBeInTheDocument();
    });
  
      await waitFor(() => {
        expect(screen.queryByText("Menyimpan...")).not.toBeInTheDocument();
      });
    await waitFor(() => {
      expect(screen.queryByText("Menyimpan...")).not.toBeInTheDocument();
    });
  });

  it('navigates back when the Kembali button is clicked', async () => {
    render(<AddDivisi />);
  
    await waitFor(() => {
      expect(screen.getByText("Kembali")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Kembali"));
    expect(mockPush).toHaveBeenCalledWith("/dashboard/division");
  });

  it("navigates back when the Batalkan button is clicked", async () => {
    render(<AddDivisi />);
    
    await waitFor(() => {
      expect(screen.getByText("Batalkan")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Batalkan"));
    expect(mockBack).toHaveBeenCalled();;
  });
});