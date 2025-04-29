import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import SparePartEditPage from "@/app/dashboard/spare-part/[id]/edit/page"
import { useRouter, useParams } from "next/navigation"
import { format } from "date-fns"

// Mock dependencies for SparePartEdit component
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(() => ({ id: "test-id" })),
}))

jest.mock("js-cookie", () => ({
  get: jest.fn().mockReturnValue("mock-token"),
}))

// Mock fetch
global.fetch = jest.fn()

// We're NOT mocking the actual SparePartEdit component
// This allows us to test both the wrapper and implementation

describe("SparePartEditPage Tests", () => {
  // Test the wrapper component first
  it("renders the SparePartEdit component", () => {
    render(<SparePartEditPage />)
    
    // The wrapper should render the implementation component
    // which initially shows "Loading..."
    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  // Now test the implementation component functionality
  describe("SparePartEdit Implementation", () => {
    // Setup common mocks
    const mockRouter = {
      push: jest.fn(),
      back: jest.fn(),
    }

    const mockSparePartData = {
      id: "test-id",
      partsName: "Test Part",
      purchaseDate: "2023-01-15T00:00:00.000Z",
      price: 1000,
      toolLocation: "Test Location",
      toolDate: "2023-02-20T00:00:00.000Z",
      createdOn: "2023-01-01T00:00:00.000Z",
    }

    beforeEach(() => {
      jest.clearAllMocks()
      
      // Setup router mocks
      ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
      
      // Default fetch mock for initial data load
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockSparePartData),
      })
    })

    it("renders loading state initially", () => {
      render(<SparePartEditPage />)
      expect(screen.getByText("Loading...")).toBeInTheDocument()
    })

    it("renders the form with pre-filled data after loading", async () => {
      render(<SparePartEditPage />)

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
      })

      // Check if the title is rendered
      expect(screen.getByText("Ubah Spare Part")).toBeInTheDocument()

      // Check if form fields are pre-filled
      expect(screen.getByDisplayValue("Test Part")).toBeInTheDocument()
      expect(screen.getByDisplayValue("1000")).toBeInTheDocument()
      expect(screen.getByDisplayValue("Test Location")).toBeInTheDocument()

      // Check if dates are displayed (in formatted form)
      const purchaseDate = format(new Date(mockSparePartData.purchaseDate), "yyyy-MM-dd")
      expect(screen.getByText(purchaseDate)).toBeInTheDocument()
    })

    it("handles API error during data fetch", async () => {
      // Reset fetch mock for this test
      jest.clearAllMocks()
      ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
      
      // Mock fetch to return an error
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"))

      render(<SparePartEditPage />)

      // Wait for error to be displayed
      await waitFor(() => {
        expect(screen.getByText("Failed to fetch spare part data")).toBeInTheDocument()
      })
    })

    it("handles non-OK response during data fetch", async () => {
      // Reset fetch mock for this test
      jest.clearAllMocks()
      ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
      
      // Mock fetch to return a non-OK response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      })

      render(<SparePartEditPage />)

      // Wait for error to be displayed
      await waitFor(() => {
        expect(screen.getByText("Failed to fetch spare part data")).toBeInTheDocument()
      })
    })

    it("submits the form successfully", async () => {
      // Mock fetch for initial load and then update
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockSparePartData),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ ...mockSparePartData, partsName: "Updated Part" }),
        })

      render(<SparePartEditPage />)

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
      })

      // Update a field
      const nameInput = screen.getByDisplayValue("Test Part")
      fireEvent.change(nameInput, { target: { value: "Updated Part" } })

      // Submit the form
      fireEvent.click(screen.getByText("Simpan"))

      // Check if fetch was called with correct data
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2) // Once for initial load, once for update
        expect(global.fetch).toHaveBeenLastCalledWith(
          `${process.env.NEXT_PUBLIC_API_URL}/spareparts/test-id`,
          expect.objectContaining({
            method: "PUT",
            headers: expect.objectContaining({
              "Content-Type": "application/json",
              Authorization: "Bearer mock-token",
            }),
            body: expect.stringContaining("Updated Part"),
          }),
        )
      })

      // Check if router.push was called with success URL
      expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/spare-part?success=update")
    })

    it("handles API error during form submission", async () => {
      // Mock fetch for initial load then rejection for update
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockSparePartData),
        })
        .mockRejectedValueOnce(new Error("API Error"))

      render(<SparePartEditPage />)

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
      })

      // Submit the form without changes
      fireEvent.click(screen.getByText("Simpan"))

      // Check if error message is displayed
      await waitFor(() => {
        expect(screen.getByText("Failed to update spare part")).toBeInTheDocument()
      })

      // Check that router.push was not called
      expect(mockRouter.push).not.toHaveBeenCalled()
    })

    it("navigates back when cancel button is clicked", async () => {
      render(<SparePartEditPage />)

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
      })

      // Click the cancel button
      fireEvent.click(screen.getByText("Batalkan"))

      // Check if router.back was called
      expect(mockRouter.back).toHaveBeenCalledTimes(1)
    })

    it("validates form fields on submission", async () => {
      // Mock fetch for initial load
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockSparePartData),
      })

      render(<SparePartEditPage />)

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
      })

      // Clear required fields
      const nameInput = screen.getByDisplayValue("Test Part")
      const priceInput = screen.getByDisplayValue("1000")
      const locationInput = screen.getByDisplayValue("Test Location")

      fireEvent.change(nameInput, { target: { value: "" } })
      fireEvent.change(priceInput, { target: { value: "" } })
      fireEvent.change(locationInput, { target: { value: "" } })

      // Submit the form
      fireEvent.click(screen.getByText("Simpan"))

      // Check if validation errors are displayed
      await waitFor(() => {
        expect(screen.getByText(/Nama spare part wajib diisi/i)).toBeInTheDocument()
        expect(screen.getByText(/Harga wajib diisi/i)).toBeInTheDocument()
        expect(screen.getByText(/Lokasi alat wajib diisi/i)).toBeInTheDocument()
      })

      // Check that fetch was not called for update
      expect(global.fetch).toHaveBeenCalledTimes(1) // Only the initial load
    })
  })
})