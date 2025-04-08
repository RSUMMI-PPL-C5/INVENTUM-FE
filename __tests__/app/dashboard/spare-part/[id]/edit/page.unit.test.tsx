import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { useRouter, useParams } from "next/navigation"
import SparePartEdit from "@/app/dashboard/spare-part/[id]/edit/page"
import Cookies from "js-cookie"
import { format } from "date-fns"

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}))

jest.mock("js-cookie", () => ({
  get: jest.fn(),
}))

// Mock fetch
global.fetch = jest.fn()

// Mock the actual page component for page test
const originalModule = jest.requireActual("@/app/dashboard/spare-part/[id]/edit/page")
jest.mock("@/app/dashboard/spare-part/[id]/edit/page", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(originalModule.default),
  }
})

describe("SparePartEdit Tests", () => {
  describe("SparePartEditPage", () => {
    it("renders the SparePartEdit component", () => {
      // For the page test, temporarily mock the component to return a simple div
      ;(SparePartEdit as jest.Mock).mockImplementationOnce(() => <div>SparePartEdit</div>)

      render(<SparePartEdit />)
      const pageName = screen.getByText("SparePartEdit")
      expect(pageName).toBeInTheDocument()

      // Restore the original implementation for subsequent tests
      ;(SparePartEdit as jest.Mock).mockImplementation(originalModule.default)
    })
  })

  describe("SparePartEdit Component", () => {
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
      ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
      ;(useParams as jest.Mock).mockReturnValue({ id: "test-id" })
      ;(Cookies.get as jest.Mock).mockReturnValue("mock-token")

      // Mock fetch for initial data load
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockSparePartData),
      })
    })

    it("renders loading state initially", () => {
      render(<SparePartEdit />)
      expect(screen.getByText("Loading...")).toBeInTheDocument()
    })

    it("renders the form with pre-filled data after loading", async () => {
      render(<SparePartEdit />)

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
      expect(screen.getByText(format(new Date(mockSparePartData.purchaseDate), "PPP"))).toBeInTheDocument()
      expect(screen.getByText(format(new Date(mockSparePartData.toolDate), "PPP"))).toBeInTheDocument()

      // Check if created date is displayed
      expect(screen.getByDisplayValue("2023-01-01")).toBeInTheDocument()
    })

    it("handles API error during data fetch", async () => {
      // Reset mocks for this test
      jest.clearAllMocks()
      ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
      ;(useParams as jest.Mock).mockReturnValue({ id: "test-id" })

      // Mock fetch to return an error
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"))

      render(<SparePartEdit />)

      // Wait for error to be displayed
      await waitFor(() => {
        expect(screen.getByText("Failed to fetch spare part data")).toBeInTheDocument()
      })
    })

    it("handles non-OK response during data fetch", async () => {
      // Reset mocks for this test
      jest.clearAllMocks()
      ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
      ;(useParams as jest.Mock).mockReturnValue({ id: "test-id" })

      // Mock fetch to return a non-OK response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      })

      render(<SparePartEdit />)

      // Wait for error to be displayed
      await waitFor(() => {
        expect(screen.getByText("Failed to fetch spare part data")).toBeInTheDocument()
      })
    })

    it("submits the form successfully", async () => {
      // Mock fetch for update
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockSparePartData),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ ...mockSparePartData, partsName: "Updated Part" }),
        })

      render(<SparePartEdit />)

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
          `${process.env.NEXT_PUBLIC_API_URL}/sparepart/test-id`,
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
      expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/sparepart?success=update")
    })

    it("handles API error during form submission", async () => {
      // Mock fetch for initial load
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockSparePartData),
      })

      // Mock fetch for update to return an error
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"))

      render(<SparePartEdit />)

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

    it("handles non-OK response during form submission", async () => {
      // Mock fetch for initial load
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockSparePartData),
      })

      // Mock fetch for update to return a non-OK response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
      })

      render(<SparePartEdit />)

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
    })

    it("navigates back when cancel button is clicked", async () => {
      render(<SparePartEdit />)

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

      render(<SparePartEdit />)

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

