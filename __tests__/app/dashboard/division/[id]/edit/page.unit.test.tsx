import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import { useRouter } from "next/navigation"
import EditDivisiPage from "@/app/dashboard/division/[id]/edit/page"
import EditDivisi from "@/modules/division/edit-divisi"
import Cookies from "js-cookie"

// First fix the page component mock to match your actual component
// Update the types for the EditDivisiPage component props
interface PageProps {
  params: { id: string }
}

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn().mockReturnValue({ id: "1" }),
  use: jest.fn().mockImplementation((param: any) => param)
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
jest.mock("@/modules/division/edit-divisi", () => {
  return jest.fn(({ id }: { id: number }) => (
    <div data-testid="edit-divisi">EditDivisi Component (ID: {id})</div>
  ))
})

describe("EditDivisiPage", () => {
  it("renders the EditDivisi component with correct ID", () => {
    // Cast EditDivisiPage to accept the params prop
    const Component = EditDivisiPage as React.FC<PageProps>;
    render(<Component params={{ id: "1" }} />)
    
    expect(screen.getByTestId("edit-divisi")).toBeInTheDocument()
    expect(screen.getByText("EditDivisi Component (ID: 1)")).toBeInTheDocument()
  })
})

// Unmock EditDivisi for direct component tests
jest.unmock("@/modules/division/edit-divisi")

// Mock form components with simple implementations
jest.mock("@/components/ui/form", () => ({
  Form: ({ children, ...props }: { children: React.ReactNode }) => 
    <div data-testid="form" {...props}>{children}</div>,
  FormField: ({ render }: { render: (props: { field: any }) => React.ReactNode }) => {
    const field = { 
      value: "Test Division", 
      onChange: jest.fn(), 
      onBlur: jest.fn(),
      ref: { current: null }
    }
    return render({ field })
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

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button data-testid="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}))

// Mock lucide-react
jest.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader">Loading...</div>
}))

// Mock hook form
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
    setValue: jest.fn(),
    formState: { errors: {} }
  }),
}))

describe("EditDivisi Component", () => {
  const mockPush = jest.fn()
  const mockToast = jest.fn()
  
  // Mock test data
  const mockDivision = {
    id: 1,
    divisi: "Test Division",
    parentId: null
  }
  
  const mockDivisions = [
    {
      id: 2,
      divisi: "Operations",
      parentId: null,
      children: []
    },
    {
      id: 3,
      divisi: "IT Department",
      parentId: null,
      children: []
    }
  ]
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Router mock
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    })
    
    // Cookie mock
    (Cookies.get as jest.Mock).mockReturnValue("mock-token")
    
    // Toast mock
    const useToastModule = require("@/hooks/use-toast")
    useToastModule.useToast.mockReturnValue({
      toast: mockToast
    })
    
    // Default fetch implementation - fix the any type for url
    (global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
      if (url.includes("/divisi/1")) {
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue(mockDivision)
        })
      } else if (url.includes("/divisi/all")) {
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue(mockDivisions)
        })
      }
      return Promise.resolve({ ok: true })
    })
  })
  
  // Basic tests - success path
  it("should fetch division data and show form", async () => {
    render(<EditDivisi id={1} />)
    
    // Initially shows loading state
    expect(screen.getByTestId("loader")).toBeInTheDocument()
    
    // Wait for data to load and form to appear
    await waitFor(() => {
      expect(screen.getByText("Form Edit Divisi")).toBeInTheDocument()
    })
    
    // Check API calls
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/divisi/1",
      expect.anything()
    )
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/divisi/all",
      expect.anything()
    )
  })
  
  // Remaining tests - fix type issues...
  it("should submit form successfully", async () => {
    render(<EditDivisi id={1} />)
    
    await waitFor(() => {
      expect(screen.getByText("Form Edit Divisi")).toBeInTheDocument()
    })
    
    // Find and click submit button
    fireEvent.click(screen.getByText("Simpan Perubahan"))
    
    // Should show toast and navigate
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Success",
        description: "Division updated successfully"
      })
      expect(mockPush).toHaveBeenCalledWith("/dashboard/division")
    })
  })
  
  // Fix all the other tests by adding type annotations to the fetch mock implementations
  it("should handle error when fetching division", async () => {
    // Mock error response for division
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/divisi/1")) {
        return Promise.resolve({ ok: false })
      }
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDivisions)
      })
    })
    
    render(<EditDivisi id={1} />)
    
    // Should show error state
    await waitFor(() => {
      expect(screen.getByText("Failed to load division data.")).toBeInTheDocument()
    })
  })
  
  it("should handle error when fetching all divisions", async () => {
    // Mock error for all divisions
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/divisi/all")) {
        return Promise.reject(new Error("Network error"))
      }
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDivision)
      })
    })
    
    render(<EditDivisi id={1} />)
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Failed to load parent divisions",
        variant: "destructive"
      })
    })
  })
  
  it("should handle error when updating division", async () => {
    // Mock success for GET but failure for PUT
    (global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
      if (options?.method === "PUT") {
        return Promise.resolve({ ok: false })
      }
      if (url.includes("/divisi/1")) {
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue(mockDivision)
        })
      }
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDivisions)
      })
    })
    
    render(<EditDivisi id={1} />)
    
    await waitFor(() => {
      expect(screen.getByText("Form Edit Divisi")).toBeInTheDocument()
    })
    
    // Submit form
    fireEvent.click(screen.getByText("Simpan Perubahan"))
    
    // Should show error toast
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Failed to update division",
        variant: "destructive"
      })
    })
  })
  
  // Fix the remaining tests similarly...
  it("should show loading state during form submission", async () => {
    // Mock a slow PUT response
    (global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
      if (options?.method === "PUT") {
        return new Promise(resolve => {
          setTimeout(() => resolve({ ok: true }), 100)
        })
      }
      if (url.includes("/divisi/1")) {
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue(mockDivision)
        })
      }
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDivisions)
      })
    })
    
    render(<EditDivisi id={1} />)
    
    await waitFor(() => {
      expect(screen.getByText("Form Edit Divisi")).toBeInTheDocument()
    })
    
    // Submit form
    fireEvent.click(screen.getByText("Simpan Perubahan"))
    
    // Check loading state
    expect(screen.getByText("Menyimpan...")).toBeInTheDocument()
  })
})