import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useRouter } from "next/navigation";
import EditDivisi from "@/modules/division/edit-divisi";
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

describe("EditDivisi Component", () => {
  const mockPush = jest.fn();
  const mockToast = jest.fn();

  const mockDivision = {
    id: 1,
    divisi: "Test Division",
    parentId: null,
  };

  const mockDivisions = [
    {
      id: 2,
      divisi: "Operations",
      parentId: null,
      children: [],
    },
    {
      id: 3,
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
    });

    // Mock cookies
    (Cookies.get as jest.Mock).mockReturnValue("mock-token");

    // Mock toast
    const useToastModule = require("@/hooks/use-toast");
    useToastModule.useToast.mockReturnValue({
      toast: mockToast,
    });

    // Mock fetch success
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/divisi/1")) {
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue(mockDivision),
        });
      }
      if (url.includes("/divisi/all")) {
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue(mockDivisions),
        });
      }
      return Promise.resolve({ ok: true });
    });
  });

  it("renders the form correctly", async () => {
    render(<EditDivisi id={1} />);

    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText("Loading division data...")).not.toBeInTheDocument();
    });

    // Assert that the form elements are rendered
    expect(screen.getByText("Form Edit Divisi")).toBeInTheDocument();
    expect(screen.getByText("Nama Divisi")).toBeInTheDocument();
    expect(screen.getByText("Parent Divisi")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Masukkan nama divisi")).toBeInTheDocument();
    expect(screen.getByText("Simpan Perubahan")).toBeInTheDocument();
  });

  it("fetches division and parent divisions on load", async () => {
    render(<EditDivisi id={1} />);

    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText("Loading division data...")).not.toBeInTheDocument();
    });

    // Assert that the fetch calls were made with the correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/divisi/1",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer mock-token",
        }),
      })
    );
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/divisi/all",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer mock-token",
        }),
      })
    );
  });

  it("submits the form successfully", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
      if (options?.method === "PUT") {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDivisions),
      });
    });

    render(<EditDivisi id={1} />);

    await waitFor(() => {
      expect(screen.queryByText("Loading division data...")).not.toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Masukkan nama divisi"), {
      target: { value: "Updated Division" },
    });
    fireEvent.click(screen.getByText("Simpan Perubahan"));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Success",
        description: "Division updated successfully",
      });
      expect(mockPush).toHaveBeenCalledWith("/dashboard/division");
    });
  });

  it("correctly handles error when fetchDivision fails", async () => {
    // Force fetch to throw an error when getting division data
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/divisi/1")) {
        return Promise.reject(new Error("Network error"));
      }
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDivisions),
      });
    });
  
    render(<EditDivisi id={1} />);
  
    // Check if error modal appears with correct error message
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Failed to load division data.")).toBeInTheDocument();
    });
  });

  it("sets form values correctly when parentId is present", async () => {
    const mockDivisionWithParent = {
      id: 1,
      divisi: "Test Division",
      parentId: 2, // Parent ID is present
    };
  
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/divisi/1")) {
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue(mockDivisionWithParent),
        });
      }
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDivisions),
      });
    });
  
    render(<EditDivisi id={1} />);
  
    await waitFor(() => {
      expect(screen.queryByText("Loading division data...")).not.toBeInTheDocument();
    });
  
    // Assert that the name field has the correct value
    expect(screen.getByPlaceholderText("Masukkan nama divisi")).toHaveValue("Test Division");
    
    // For testing the select component, check what is displayed in the trigger element
    const selectTrigger = screen.getByRole("combobox");
    
    // Wait for the select to be properly initialized with its value
    await waitFor(() => {
      expect(selectTrigger.textContent).toContain("Operations");
    });
  }); 
  
  it("sets form values correctly when parentId is null", async () => {
    const mockDivisionWithoutParent = {
      id: 1,
      divisi: "Test Division",
      parentId: null, // Parent ID is null
    };
  
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/divisi/1")) {
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue(mockDivisionWithoutParent),
        });
      }
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDivisions),
      });
    });
  
    render(<EditDivisi id={1} />);
  
    await waitFor(() => {
      expect(screen.queryByText("Loading division data...")).not.toBeInTheDocument();
    });
  
    // Assert that the name field has the correct value
    expect(screen.getByPlaceholderText("Masukkan nama divisi")).toHaveValue("Test Division");
    
    // For testing the select component, check what is displayed in the trigger element
    const selectTrigger = screen.getByRole("combobox");
    
    // Wait for the select to be properly initialized with its value
    await waitFor(() => {
      expect(selectTrigger.textContent).toContain("Tidak Ada Parent");
    });
  });

  it("handles recursive children correctly in flattenAndFilterDivisions", async () => {
    const nestedDivisions = [
      {
        id: 1,
        divisi: "Root Division",
        parentId: null,
        children: [
          {
            id: 2,
            divisi: "Child Division",
            parentId: 1,
            children: [
              {
                id: 3,
                divisi: "Grand Child Division",
                parentId: 2,
                children: [],
              },
            ],
          },
        ],
      },
      {
        id: 4,
        divisi: "Independent Division",
        parentId: null,
        children: [],
      },
    ];
  
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/divisi/all")) {
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue(nestedDivisions),
        });
      }
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDivision),
      });
    });
  
    render(<EditDivisi id={1} />);
  
    await waitFor(() => {
      expect(screen.queryByText("Loading division data...")).not.toBeInTheDocument();
    });
  
    // Assert that the recursive children are filtered out
    expect(screen.queryByText("Root Division")).not.toBeInTheDocument();
    expect(screen.queryByText("Child Division")).not.toBeInTheDocument();
    expect(screen.queryByText("Grand Child Division")).not.toBeInTheDocument();
  
    // Assert that independent divisions are still present
    expect(screen.getByText("Independent Division")).toBeInTheDocument();
  });

  it("closes error modal when Tutup button is clicked", async () => {
    // Force fetch to throw an error to make error modal appear
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/divisi/1")) {
        return Promise.reject(new Error("Network error"));
      }
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDivisions),
      });
    });
  
    render(<EditDivisi id={1} />);
  
    // Wait for error modal to appear
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  
    // Click the Tutup button
    fireEvent.click(screen.getByText("Tutup"));
  
    // Verify modal is closed
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("displays error modal when fetching parent divisions fails", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/divisi/all")) {
        return Promise.resolve({ ok: false });
      }
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDivision),
      });
    });
  
    render(<EditDivisi id={1} />);
  
    await waitFor(() => {
      expect(screen.getByText("Failed to load parent divisions.")).toBeInTheDocument();
    });
  });
  
  it("prevents circular references by filtering out current division and its children", async () => {
    const mockNestedDivisions = [
      {
        id: 1,
        divisi: "Parent Division",
        parentId: null,
        children: [
          {
            id: 4,
            divisi: "Child Division",
            parentId: 1,
            children: [],
          },
        ],
      },
      {
        id: 2,
        divisi: "Independent Division",
        parentId: null,
        children: [],
      },
    ];
  
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/divisi/all")) {
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue(mockNestedDivisions),
        });
      }
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDivision),
      });
    });
  
    render(<EditDivisi id={1} />);
  
    await waitFor(() => {
      expect(screen.queryByText("Child Division")).not.toBeInTheDocument();
      expect(screen.getByText("Independent Division")).toBeInTheDocument();
    });
  });
  
  it("displays loading spinner while fetching data", () => {
    render(<EditDivisi id={1} />);
  
    expect(screen.getByText("Loading division data...")).toBeInTheDocument();
  });
  
  it("displays error modal when form submission fails", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
      if (options?.method === "PUT") {
        return Promise.resolve({ ok: false });
      }
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDivisions),
      });
    });
  
    render(<EditDivisi id={1} />);
  
    await waitFor(() => {
      expect(screen.queryByText("Loading division data...")).not.toBeInTheDocument();
    });
  
    fireEvent.change(screen.getByPlaceholderText("Masukkan nama divisi"), {
      target: { value: "Updated Division" },
    });
    fireEvent.click(screen.getByText("Simpan Perubahan"));
  
    await waitFor(() => {
      expect(screen.getByText("Gagal mengupdate divisi. Silakan cek kembali cek kembali nama divisi dan parent divisi yang dipilih.")).toBeInTheDocument();
    });
  });
  
  it("navigates back to division list when 'Back' button is clicked", async () => {
    render(<EditDivisi id={1} />);
  
    await waitFor(() => {
      expect(screen.queryByText("Loading division data...")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Back"));
  
    expect(mockPush).toHaveBeenCalledWith("/dashboard/division");
  });

  it("handles API error when fetching division", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/divisi/1")) {
        return Promise.resolve({ ok: false });
      }
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDivisions),
      });
    });

    render(<EditDivisi id={1} />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load division data.")).toBeInTheDocument();
    });
  });
});