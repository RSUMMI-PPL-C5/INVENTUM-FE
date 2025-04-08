import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import { useRouter } from "next/navigation"
import AddDivisiPage from "@/app/dashboard/division/add/page"
import AddDivisi from "@/modules/division/add-divisi"
import Cookies from "js-cookie"
import { act } from "react-dom/test-utils"

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}))

// Mock js-cookie
jest.mock("js-cookie", () => ({
  get: jest.fn(),
}))

// Mock @/hooks/use-toast
jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn().mockReturnValue({
    toast: jest.fn(),
  }),
}))

// Mock fetch
global.fetch = jest.fn() as jest.Mock

// Mock component for page tests
jest.mock("@/modules/division/add-divisi", () => {
  return jest.fn(() => <div data-testid="add-divisi">AddDivisi Component</div>)
})

describe("AddDivisiPage", () => {
  it("renders the AddDivisi component", () => {
    render(<AddDivisiPage />)
    
    // Check that AddDivisi was rendered
    expect(screen.getByTestId("add-divisi")).toBeInTheDocument()
    
    // Verify the AddDivisi component was called
    expect(AddDivisi).toHaveBeenCalled()
  })
})

// Unmock AddDivisi for direct component tests
jest.unmock("@/modules/division/add-divisi")

// Mock form components with proper TypeScript types
jest.mock("@/components/ui/form", () => ({
  Form: ({ children, ...props }: { children: React.ReactNode }) => 
    <div data-testid="form" {...props}>{children}</div>,
    
  FormField: ({ 
    children, 
    control, 
    name, 
    render 
  }: { 
    children?: React.ReactNode;
    control: any;
    name: string;
    render: (props: { field: any }) => React.ReactNode;
  }) => {
    // Call render with mock field to simulate form field
    const field = { 
      value: name === "divisi" ? "Test Division" : name === "parentId" ? "1" : "",
      onChange: jest.fn(),
      onBlur: jest.fn(),
      ref: { current: null }
    }
    return <div data-testid={`form-field-${name}`}>{render({ field })}</div>
  },
  
  FormItem: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="form-item">{children}</div>,
    
  FormLabel: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="form-label">{children}</div>,
    
  FormControl: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="form-control">{children}</div>,
    
  FormDescription: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="form-description">{children}</div>,
    
  FormMessage: () => <div data-testid="form-message"></div>,
}))

jest.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input data-testid="input" {...props} />
}))

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange }: { children: React.ReactNode, onValueChange?: (value: string) => void }) => (
    <div data-testid="select" onClick={() => onValueChange && onValueChange("1")}>{children}</div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="select-content">{children}</div>,
    
  SelectItem: ({ children, value }: { children: React.ReactNode, value: string }) => 
    <div data-testid={`select-item-${value}`}>{children}</div>,
    
  SelectTrigger: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="select-trigger">{children}</div>,
    
  SelectValue: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="select-value">{children}</div>,
}))

jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="card">{children}</div>,
    
  CardContent: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="card-content">{children}</div>,
    
  CardHeader: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="card-header">{children}</div>,
    
  CardTitle: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="card-title">{children}</div>,
}))

jest.mock("@/components/ui/button", () => {
  return {
    Button: ({ 
      children, 
      onClick, 
      type 
    }: { 
      children: React.ReactNode;
      onClick?: () => void;
      type?: string;
    }) => (
      <button data-testid={`button-${type || "default"}`} onClick={onClick}>
        {children}
      </button>
    ),
  }
})

// Mock hook form with proper types
jest.mock("react-hook-form", () => ({
  useForm: () => ({
    handleSubmit: (callback: (data: any) => void) => (e?: React.FormEvent) => {
      e?.preventDefault?.()
      return callback({ 
        divisi: "Test Division", 
        parentId: "1" 
      })
    },
    control: {},
    formState: { errors: {} },
    setValue: jest.fn(),
  }),
}))

describe("AddDivisi Component", () => {
  const mockPush = jest.fn()
  const mockToast = jest.fn()

  // Simplify tests with these helper functions
  const mockFetchSuccess = (responseData: any) => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(responseData)
    })
  }

  const mockPostSuccess = () => {
    (global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
      if (options?.method === 'POST') {
        return Promise.resolve({ ok: true })
      }
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDivisions)
      })
    })
  }

  // Mock division data
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
          children: []
        }
      ]
    },
    {
      id: 2,
      divisi: "IT Department",
      parentId: null,
      children: []
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })

    // Default cookie mock
    (Cookies.get as jest.Mock).mockReturnValue("mock-token")

    // Default toast mock
    const useToastModule = require("@/hooks/use-toast")
    useToastModule.useToast.mockReturnValue({
      toast: mockToast,
    })

    // Default fetch success for divisions
    mockFetchSuccess(mockDivisions)
  })

  // Basic rendering test
  it("should render the form correctly", async () => {
    render(<AddDivisi />)
    
    // Verify key elements
    expect(screen.getByText("Tambah Divisi Baru")).toBeInTheDocument()
    expect(screen.getByText("Nama Divisi")).toBeInTheDocument()
    expect(screen.getByText("Parent Divisi")).toBeInTheDocument()
    expect(screen.getByTestId("input")).toBeInTheDocument()
    expect(screen.getByTestId("button-submit")).toBeInTheDocument()
  })

  // Positive tests
  it("should fetch parent divisions on load", async () => {
    render(<AddDivisi />)
    
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/divisi/all",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer mock-token",
        }),
      })
    )
  })

  it("should submit form successfully", async () => {
    mockPostSuccess()
    render(<AddDivisi />)
    
    fireEvent.click(screen.getByTestId("button-submit"))
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Success",
        description: "Division created successfully",
      })
      expect(mockPush).toHaveBeenCalledWith("/dashboard/division")
    })
  })

  it("should navigate back when back button is clicked", () => {
    render(<AddDivisi />)
    fireEvent.click(screen.getByText("Back"))
    expect(mockPush).toHaveBeenCalledWith("/dashboard/division")
  })

  // Error handling tests
  it("should handle API error when fetching divisions", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Failed to fetch"))
    
    render(<AddDivisi />)
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Failed to load parent divisions",
        variant: "destructive",
      })
    })
  })

  it("should handle API error when submitting form", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
      if (options?.method === 'POST') {
        return Promise.resolve({ ok: false })
      }
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDivisions)
      })
    })
    
    render(<AddDivisi />)
    fireEvent.click(screen.getByTestId("button-submit"))
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Failed to create division",
        variant: "destructive",
      })
    })
  })

  it("should handle loading state during form submission", async () => {
    // Mock delayed response
    (global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
      if (options?.method === 'POST') {
        return new Promise(resolve => {
          setTimeout(() => resolve({ ok: true }), 100)
        })
      }
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDivisions)
      })
    })
    
    render(<AddDivisi />)
    fireEvent.click(screen.getByTestId("button-submit"))
    
    expect(screen.getByText("Menyimpan...")).toBeInTheDocument()
  })
})