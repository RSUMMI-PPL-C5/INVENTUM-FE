import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useRouter, useParams } from "next/navigation"
import PartsHistoryCreate from "@/app/dashboard/medical-equipment/[id]/spare-part/page"
import Cookies from "js-cookie"
import { toast } from "sonner"
import { format } from "date-fns"

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}))

jest.mock("js-cookie", () => ({
  get: jest.fn(),
}))

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

jest.mock("date-fns", () => ({
  format: jest.fn(),
}))

// Mock console.log
console.log = jest.fn()

// Mock fetch
global.fetch = jest.fn()

describe("PartsHistoryCreate Component", () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  }

  const mockParams = {
    id: "test-equipment-id",
  }

  const mockSpareparts = [
    {
      id: "id-1",
      partsName: "Part A",
      purchaseDate: "2025-01-01T00:00:00.000Z",
      price: 1000,
      toolLocation: "Loc A",
    },
    {
      id: "id-2",
      partsName: "Part B",
      purchaseDate: "2025-01-02T00:00:00.000Z",
      price: 2000,
      toolLocation: "Loc B",
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mocks
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useParams as jest.Mock).mockReturnValue(mockParams)
    ;(Cookies.get as jest.Mock).mockReturnValue("test-token")
    ;(format as jest.Mock).mockReturnValue("01 Januari 2025")

    // Mock successful equipment fetch by default
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: "test-equipment-id",
            name: "MRI Machine",
            brandName: "GE",
            modelName: "Model X",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockSpareparts,
        }),
      })
  })

  it("renders the component correctly", async () => {
    render(<PartsHistoryCreate />)

    // Wait for equipment and spareparts data to load
    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Suku Cadang")).toBeInTheDocument()
      expect(screen.getByText("MRI Machine - GE Model X")).toBeInTheDocument()
    })

    // Check form fields
    expect(screen.getByText("Suku Cadang")).toBeInTheDocument()
    expect(screen.getByLabelText("Tindakan yang Dilakukan")).toBeInTheDocument()
    expect(screen.getByLabelText("Teknisi")).toBeInTheDocument()
    expect(screen.getByText("Hasil")).toBeInTheDocument()
    expect(screen.getByText("Tanggal Penggantian")).toBeInTheDocument()

    // Check buttons
    expect(screen.getByText("Kembali")).toBeInTheDocument()
    expect(screen.getByText("Simpan")).toBeInTheDocument()
    expect(screen.getByText("Batal")).toBeInTheDocument()
  })

  it("navigates back when back button is clicked", async () => {
    render(<PartsHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Suku Cadang")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText("Kembali"))
    expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/medical-equipment/test-equipment-id")
  })

  it("navigates back when cancel button is clicked", async () => {
    render(<PartsHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Suku Cadang")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText("Batal"))
    expect(mockRouter.back).toHaveBeenCalled()
  })

  it("shows validation errors when form is submitted with empty fields", async () => {
    render(<PartsHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Suku Cadang")).toBeInTheDocument()
    })

    // Submit empty form
    fireEvent.click(screen.getByText("Simpan"))

    // Check validation errors
    await waitFor(() => {
      expect(screen.getByText("Suku cadang wajib diisi")).toBeInTheDocument()
      expect(screen.getByText("Tindakan yang dilakukan wajib diisi")).toBeInTheDocument()
      expect(screen.getByText("Nama teknisi wajib diisi")).toBeInTheDocument()
      expect(screen.getByText("Hasil wajib diisi")).toBeInTheDocument()
      expect(screen.getByText("Tanggal penggantian wajib diisi")).toBeInTheDocument()
    })
  })

  it("successfully submits the form with valid data", async () => {
    const user = userEvent.setup()

    // Mock successful form submission
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: "test-equipment-id",
            name: "MRI Machine",
            brandName: "GE",
            modelName: "Model X",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockSpareparts,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

    render(<PartsHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Suku Cadang")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Penggantian suku cadang")
    await user.type(screen.getByLabelText("Teknisi"), "John Doe")

    // Select sparepart
    const sparepartSelect = screen.getByText("Pilih suku cadang")
    await user.click(sparepartSelect)
    await waitFor(() => {
      expect(screen.getByText("Part A - Loc A")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Part A - Loc A"))

    // Select result
    const resultSelect = screen.getByText("Pilih hasil")
    await user.click(resultSelect)
    await waitFor(() => {
      expect(screen.getByText("Berhasil")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Berhasil"))

    // Select date
    const dateButton = screen.getByText("Pilih tanggal")
    await user.click(dateButton)

    // Click on a date in the calendar
    const dateCell = document.querySelector('[role="gridcell"]:not([aria-disabled="true"])')
    if (dateCell) {
      await user.click(dateCell)
    }

    // Submit form
    await user.click(screen.getByText("Simpan"))

    // Verify form submission
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(3)
      expect(global.fetch).toHaveBeenLastCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/test-equipment-id/parts-history`,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          }),
          body: expect.any(String),
        }),
      )

      // Check payload
      const lastCallBody = JSON.parse((global.fetch as jest.Mock).mock.calls[2][1].body)
      expect(lastCallBody).toEqual({
        sparepartId: "id-1",
        actionPerformed: "Penggantian suku cadang",
        technician: "John Doe",
        result: "Success",
        replacementDate: expect.any(String),
      })

      // Verify console.log was called with the payload
      expect(console.log).toHaveBeenCalledWith(
        expect.objectContaining({
          sparepartId: "id-1",
          actionPerformed: "Penggantian suku cadang",
          technician: "John Doe",
          result: "Success",
          replacementDate: expect.any(String),
        }),
      )

      expect(toast.success).toHaveBeenCalledWith("Riwayat suku cadang berhasil dibuat")
      expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/medical-equipment/test-equipment-id")
    })
  })

  it("handles API error when fetching equipment", async () => {
    // Reset fetch mock to return error for equipment fetch
    ;(global.fetch as jest.Mock).mockReset()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Error fetching equipment" }),
    })

    render(<PartsHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Gagal memuat detail peralatan medis.")).toBeInTheDocument()
    })
  })

  it("handles API error when fetching spareparts", async () => {
    // Reset fetch mock to return success for equipment but error for spareparts
    ;(global.fetch as jest.Mock).mockReset()
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: "test-equipment-id",
            name: "MRI Machine",
            brandName: "GE",
            modelName: "Model X",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Error fetching spareparts" }),
      })

    render(<PartsHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Gagal memuat suku cadang.")).toBeInTheDocument()
    })
  })

  it("handles network error when fetching equipment", async () => {
    // Reset fetch mock to throw error for equipment fetch
    ;(global.fetch as jest.Mock).mockReset()
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"))

    render(<PartsHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Gagal memuat detail peralatan medis.")).toBeInTheDocument()
    })
  })

  it("handles network error when fetching spareparts", async () => {
    // Reset fetch mock to return success for equipment but throw error for spareparts
    ;(global.fetch as jest.Mock).mockReset()
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: "test-equipment-id",
            name: "MRI Machine",
            brandName: "GE",
            modelName: "Model X",
          },
        }),
      })
      .mockRejectedValueOnce(new Error("Network error"))

    render(<PartsHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Gagal memuat suku cadang.")).toBeInTheDocument()
    })
  })

  it("handles API error when submitting form", async () => {
    const user = userEvent.setup()

    // Mock successful equipment and spareparts fetch but failed form submission
    ;(global.fetch as jest.Mock).mockReset()
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: "test-equipment-id",
            name: "MRI Machine",
            brandName: "GE",
            modelName: "Model X",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockSpareparts,
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Error creating parts history" }),
      })

    render(<PartsHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Suku Cadang")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Penggantian suku cadang")
    await user.type(screen.getByLabelText("Teknisi"), "John Doe")

    // Select sparepart
    const sparepartSelect = screen.getByText("Pilih suku cadang")
    await user.click(sparepartSelect)
    await waitFor(() => {
      expect(screen.getByText("Part A - Loc A")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Part A - Loc A"))

    // Select result
    const resultSelect = screen.getByText("Pilih hasil")
    await user.click(resultSelect)
    await waitFor(() => {
      expect(screen.getByText("Berhasil")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Berhasil"))

    // Select date
    const dateButton = screen.getByText("Pilih tanggal")
    await user.click(dateButton)

    // Click on a date in the calendar
    const dateCell = document.querySelector('[role="gridcell"]:not([aria-disabled="true"])')
    if (dateCell) {
      await user.click(dateCell)
    }

    // Submit form
    await user.click(screen.getByText("Simpan"))

    // Verify error handling
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })
  })

  it("handles network error when submitting form", async () => {
    const user = userEvent.setup()

    // Mock successful equipment and spareparts fetch but network error on form submission
    ;(global.fetch as jest.Mock).mockReset()
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: "test-equipment-id",
            name: "MRI Machine",
            brandName: "GE",
            modelName: "Model X",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockSpareparts,
        }),
      })
      .mockRejectedValueOnce(new Error("Network error"))

    render(<PartsHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Suku Cadang")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Penggantian suku cadang")
    await user.type(screen.getByLabelText("Teknisi"), "John Doe")

    // Select sparepart
    const sparepartSelect = screen.getByText("Pilih suku cadang")
    await user.click(sparepartSelect)
    await waitFor(() => {
      expect(screen.getByText("Part A - Loc A")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Part A - Loc A"))

    // Select result
    const resultSelect = screen.getByText("Pilih hasil")
    await user.click(resultSelect)
    await waitFor(() => {
      expect(screen.getByText("Berhasil")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Berhasil"))

    // Select date
    const dateButton = screen.getByText("Pilih tanggal")
    await user.click(dateButton)

    // Click on a date in the calendar
    const dateCell = document.querySelector('[role="gridcell"]:not([aria-disabled="true"])')
    if (dateCell) {
      await user.click(dateCell)
    }

    // Submit form
    await user.click(screen.getByText("Simpan"))

    // Verify error handling
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
      expect(screen.getByText("Gagal membuat riwayat suku cadang. Silakan coba lagi.")).toBeInTheDocument()
    })
  })

  it("shows loading state during form submission", async () => {
    const user = userEvent.setup()

    // Mock successful equipment and spareparts fetch and delayed form submission
    ;(global.fetch as jest.Mock).mockReset()
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: "test-equipment-id",
            name: "MRI Machine",
            brandName: "GE",
            modelName: "Model X",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockSpareparts,
        }),
      })
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => ({ success: true }),
              })
            }, 100)
          }),
      )

    render(<PartsHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Suku Cadang")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Penggantian suku cadang")
    await user.type(screen.getByLabelText("Teknisi"), "John Doe")

    // Select sparepart
    const sparepartSelect = screen.getByText("Pilih suku cadang")
    await user.click(sparepartSelect)
    await waitFor(() => {
      expect(screen.getByText("Part A - Loc A")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Part A - Loc A"))

    // Select result
    const resultSelect = screen.getByText("Pilih hasil")
    await user.click(resultSelect)
    await waitFor(() => {
      expect(screen.getByText("Berhasil")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Berhasil"))

    // Select date
    const dateButton = screen.getByText("Pilih tanggal")
    await user.click(dateButton)

    // Click on a date in the calendar
    const dateCell = document.querySelector('[role="gridcell"]:not([aria-disabled="true"])')
    if (dateCell) {
      await user.click(dateCell)
    }

    // Submit form
    await user.click(screen.getByText("Simpan"))

    // Verify loading state
    expect(screen.getByText("Menyimpan...")).toBeInTheDocument()

    // Wait for submission to complete
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Riwayat suku cadang berhasil dibuat")
    })
  })

  it("handles error in createPartsHistory function", async () => {
    const user = userEvent.setup()

    // Mock successful equipment fetch but error in toast
    ;(global.fetch as jest.Mock).mockReset()
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: "test-equipment-id",
            name: "MRI Machine",
            brandName: "GE",
            modelName: "Model X",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockSpareparts,
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Error message" }),
      })

    render(<PartsHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Suku Cadang")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Penggantian suku cadang")
    await user.type(screen.getByLabelText("Teknisi"), "John Doe")

    // Select sparepart
    const sparepartSelect = screen.getByText("Pilih suku cadang")
    await user.click(sparepartSelect)
    await waitFor(() => {
      expect(screen.getByText("Part A - Loc A")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Part A - Loc A"))

    // Select result
    const resultSelect = screen.getByText("Pilih hasil")
    await user.click(resultSelect)
    await waitFor(() => {
      expect(screen.getByText("Berhasil")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Berhasil"))

    // Select date
    const dateButton = screen.getByText("Pilih tanggal")
    await user.click(dateButton)

    // Click on a date in the calendar
    const dateCell = document.querySelector('[role="gridcell"]:not([aria-disabled="true"])')
    if (dateCell) {
      await user.click(dateCell)
    }

    // Submit form
    await user.click(screen.getByText("Simpan"))

    // Verify error handling
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error membuat riwayat suku cadang", "Error message")
    })
  })

  it("handles non-Error object in createPartsHistory catch block", async () => {
    const user = userEvent.setup()

    // Mock successful equipment fetch but throw string in fetch
    ;(global.fetch as jest.Mock).mockReset()
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: "test-equipment-id",
            name: "MRI Machine",
            brandName: "GE",
            modelName: "Model X",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockSpareparts,
        }),
      })
      .mockImplementationOnce(() => {
        throw "String error"
      })

    render(<PartsHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Suku Cadang")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Penggantian suku cadang")
    await user.type(screen.getByLabelText("Teknisi"), "John Doe")

    // Select sparepart
    const sparepartSelect = screen.getByText("Pilih suku cadang")
    await user.click(sparepartSelect)
    await waitFor(() => {
      expect(screen.getByText("Part A - Loc A")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Part A - Loc A"))

    // Select result
    const resultSelect = screen.getByText("Pilih hasil")
    await user.click(resultSelect)
    await waitFor(() => {
      expect(screen.getByText("Berhasil")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Berhasil"))

    // Select date
    const dateButton = screen.getByText("Pilih tanggal")
    await user.click(dateButton)

    // Click on a date in the calendar
    const dateCell = document.querySelector('[role="gridcell"]:not([aria-disabled="true"])')
    if (dateCell) {
      await user.click(dateCell)
    }

    // Submit form
    await user.click(screen.getByText("Simpan"))

    // Verify error handling
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error membuat riwayat suku cadang")
    })
  })

  it("handles successful API response in createPartsHistory function", async () => {
    const user = userEvent.setup()

    // Mock successful equipment and spareparts fetch and successful form submission with response data
    ;(global.fetch as jest.Mock).mockReset()
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: "test-equipment-id",
            name: "MRI Machine",
            brandName: "GE",
            modelName: "Model X",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockSpareparts,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: "new-parts-history-id",
            equipmentId: "test-equipment-id",
            sparepartId: "id-1",
            actionPerformed: "Penggantian suku cadang",
            technician: "John Doe",
            result: "Success",
            replacementDate: "2025-01-01T00:00:00.000Z",
          },
        }),
      })

    render(<PartsHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Suku Cadang")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Penggantian suku cadang")
    await user.type(screen.getByLabelText("Teknisi"), "John Doe")

    // Select sparepart
    const sparepartSelect = screen.getByText("Pilih suku cadang")
    await user.click(sparepartSelect)
    await waitFor(() => {
      expect(screen.getByText("Part A - Loc A")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Part A - Loc A"))

    // Select result
    const resultSelect = screen.getByText("Pilih hasil")
    await user.click(resultSelect)
    await waitFor(() => {
      expect(screen.getByText("Berhasil")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Berhasil"))

    // Select date
    const dateButton = screen.getByText("Pilih tanggal")
    await user.click(dateButton)

    // Click on a date in the calendar
    const dateCell = document.querySelector('[role="gridcell"]:not([aria-disabled="true"])')
    if (dateCell) {
      await user.click(dateCell)
    }

    // Submit form
    await user.click(screen.getByText("Simpan"))

    // Verify successful submission and return value
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Riwayat suku cadang berhasil dibuat")
      expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/medical-equipment/test-equipment-id")
    })
  })

  it("handles error thrown in onSubmit function", async () => {
    const user = userEvent.setup()

    // Mock successful equipment and spareparts fetch but createPartsHistory throws an error
    ;(global.fetch as jest.Mock).mockReset()
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: "test-equipment-id",
            name: "MRI Machine",
            brandName: "GE",
            modelName: "Model X",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockSpareparts,
        }),
      })

    // Mock createPartsHistory to throw an error
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
    const originalFetch = global.fetch
    global.fetch = jest.fn().mockImplementation(() => {
      throw new Error("Test error in onSubmit")
    })

    render(<PartsHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Suku Cadang")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Penggantian suku cadang")
    await user.type(screen.getByLabelText("Teknisi"), "John Doe")

    // Select sparepart
    const sparepartSelect = screen.getByText("Pilih suku cadang")
    await user.click(sparepartSelect)
    await waitFor(() => {
      expect(screen.getByText("Part A - Loc A")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Part A - Loc A"))

    // Select result
    const resultSelect = screen.getByText("Pilih hasil")
    await user.click(resultSelect)
    await waitFor(() => {
      expect(screen.getByText("Berhasil")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Berhasil"))

    // Select date
    const dateButton = screen.getByText("Pilih tanggal")
    await user.click(dateButton)

    // Click on a date in the calendar
    const dateCell = document.querySelector('[role="gridcell"]:not([aria-disabled="true"])')
    if (dateCell) {
      await user.click(dateCell)
    }

    // Submit form
    await user.click(screen.getByText("Simpan"))

    // Verify error handling in onSubmit
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to create parts history:", expect.any(Error))
      expect(screen.getByText("Gagal membuat riwayat suku cadang. Silakan coba lagi.")).toBeInTheDocument()
    })

    // Restore original implementations
    global.fetch = originalFetch
    consoleErrorSpy.mockRestore()
  })
})
