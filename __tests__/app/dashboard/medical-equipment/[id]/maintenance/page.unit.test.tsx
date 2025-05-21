import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useRouter, useParams } from "next/navigation"
import MaintenanceHistoryCreate from "@/app/dashboard/medical-equipment/[id]/maintenance/page"
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

// Mock fetch
global.fetch = jest.fn()

describe("MaintenanceHistoryCreate Component", () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  }

  const mockParams = {
    id: "test-equipment-id",
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mocks
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useParams as jest.Mock).mockReturnValue(mockParams)
    ;(Cookies.get as jest.Mock).mockReturnValue("test-token")
    ;(format as jest.Mock).mockReturnValue("01 Januari 2025")

    // Mock successful equipment fetch by default
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
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
  })

  it("renders the component correctly", async () => {
    render(<MaintenanceHistoryCreate />)

    // Wait for equipment data to load
    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Pemeliharaan")).toBeInTheDocument()
      expect(screen.getByText("MRI Machine - GE Model X")).toBeInTheDocument()
    })

    // Check form fields
    expect(screen.getByLabelText("Tindakan yang Dilakukan")).toBeInTheDocument()
    expect(screen.getByLabelText("Teknisi")).toBeInTheDocument()
    expect(screen.getByText("Hasil")).toBeInTheDocument()
    expect(screen.getByText("Tanggal Pemeliharaan")).toBeInTheDocument()

    // Check buttons
    expect(screen.getByText("Kembali")).toBeInTheDocument()
    expect(screen.getByText("Simpan")).toBeInTheDocument()
    expect(screen.getByText("Batal")).toBeInTheDocument()
  })

  it("navigates back when back button is clicked", async () => {
    render(<MaintenanceHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Pemeliharaan")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText("Kembali"))
    expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/medical-equipment/test-equipment-id")
  })

  it("navigates back when cancel button is clicked", async () => {
    render(<MaintenanceHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Pemeliharaan")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText("Batal"))
    expect(mockRouter.back).toHaveBeenCalled()
  })

  it("shows validation errors when form is submitted with empty fields", async () => {
    render(<MaintenanceHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Pemeliharaan")).toBeInTheDocument()
    })

    // Submit empty form
    fireEvent.click(screen.getByText("Simpan"))

    // Check validation errors
    await waitFor(() => {
      expect(screen.getByText("Tindakan yang dilakukan wajib diisi")).toBeInTheDocument()
      expect(screen.getByText("Nama teknisi wajib diisi")).toBeInTheDocument()
      expect(screen.getByText("Hasil wajib diisi")).toBeInTheDocument()
      expect(screen.getByText("Tanggal pemeliharaan wajib diisi")).toBeInTheDocument()
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
        json: async () => ({ success: true }),
      })

    render(<MaintenanceHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Pemeliharaan")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Pembersihan dan kalibrasi")
    await user.type(screen.getByLabelText("Teknisi"), "John Doe")

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
      expect(global.fetch).toHaveBeenCalledTimes(2)
      expect(global.fetch).toHaveBeenLastCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/test-equipment-id/maintenance-history`,
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
      const lastCallBody = JSON.parse((global.fetch as jest.Mock).mock.calls[1][1].body)
      expect(lastCallBody).toEqual({
        actionPerformed: "Pembersihan dan kalibrasi",
        technician: "John Doe",
        result: "Success",
        maintenanceDate: expect.any(String),
      })

      expect(toast.success).toHaveBeenCalledWith("Riwayat pemeliharaan berhasil dibuat")
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

    render(<MaintenanceHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Gagal memuat detail peralatan medis.")).toBeInTheDocument()
    })
  })

  it("handles network error when fetching equipment", async () => {
    // Reset fetch mock to throw error for equipment fetch
    ;(global.fetch as jest.Mock).mockReset()
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"))

    render(<MaintenanceHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Gagal memuat detail peralatan medis.")).toBeInTheDocument()
    })
  })

  it("handles API error when submitting form", async () => {
    const user = userEvent.setup()

    // Mock successful equipment fetch but failed form submission
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
        json: async () => ({ message: "Error creating maintenance history" }),
      })

    render(<MaintenanceHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Pemeliharaan")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Pembersihan dan kalibrasi")
    await user.type(screen.getByLabelText("Teknisi"), "John Doe")

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

    // Mock successful equipment fetch but network error on form submission
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

    render(<MaintenanceHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Pemeliharaan")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Pembersihan dan kalibrasi")
    await user.type(screen.getByLabelText("Teknisi"), "John Doe")

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
      expect(screen.getByText("Gagal membuat riwayat pemeliharaan. Silakan coba lagi.")).toBeInTheDocument()
    })
  })

  it("shows loading state during form submission", async () => {
    const user = userEvent.setup()

    // Mock successful equipment fetch and delayed form submission
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

    render(<MaintenanceHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Pemeliharaan")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Pembersihan dan kalibrasi")
    await user.type(screen.getByLabelText("Teknisi"), "John Doe")

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
      expect(toast.success).toHaveBeenCalledWith("Riwayat pemeliharaan berhasil dibuat")
    })
  })

  it("handles error in createMaintenanceHistory function", async () => {
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
        ok: false,
        json: async () => ({ message: "Error message" }),
      })

    render(<MaintenanceHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Pemeliharaan")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Pembersihan dan kalibrasi")
    await user.type(screen.getByLabelText("Teknisi"), "John Doe")

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
      expect(toast.error).toHaveBeenCalledWith("Error membuat riwayat pemeliharaan", "Error message")
    })
  })

  it("handles non-Error object in createMaintenanceHistory catch block", async () => {
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
      .mockImplementationOnce(() => {
        throw "String error"
      })

    render(<MaintenanceHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Pemeliharaan")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Pembersihan dan kalibrasi")
    await user.type(screen.getByLabelText("Teknisi"), "John Doe")

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
      expect(toast.error).toHaveBeenCalledWith("Error membuat riwayat pemeliharaan")
    })
  })

  it("handles successful API response in createMaintenanceHistory function", async () => {
    const user = userEvent.setup()

    // Mock successful equipment fetch and successful form submission with response data
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
          data: {
            id: "new-maintenance-id",
            medicalEquipmentId: "test-equipment-id",
            actionPerformed: "Pembersihan dan kalibrasi",
            technician: "John Doe",
            result: "Success",
            maintenanceDate: "2025-01-01T00:00:00.000Z",
          },
        }),
      })

    render(<MaintenanceHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Pemeliharaan")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Pembersihan dan kalibrasi")
    await user.type(screen.getByLabelText("Teknisi"), "John Doe")

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
      expect(toast.success).toHaveBeenCalledWith("Riwayat pemeliharaan berhasil dibuat")
      expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/medical-equipment/test-equipment-id")
    })
  })

  it("handles error thrown in onSubmit function", async () => {
    const user = userEvent.setup()

    // Mock successful equipment fetch but createMaintenanceHistory throws an error
    ;(global.fetch as jest.Mock).mockReset()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
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

    // Mock createMaintenanceHistory to throw an error
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
    const originalFetch = global.fetch
    global.fetch = jest.fn().mockImplementation(() => {
      throw new Error("Test error in onSubmit")
    })

    render(<MaintenanceHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Pemeliharaan")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Pembersihan dan kalibrasi")
    await user.type(screen.getByLabelText("Teknisi"), "John Doe")

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
      expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to create maintenance history:", expect.any(Error))
      expect(screen.getByText("Gagal membuat riwayat pemeliharaan. Silakan coba lagi.")).toBeInTheDocument()
    })

    // Restore original implementations
    global.fetch = originalFetch
    consoleErrorSpy.mockRestore()
  })

  // Tambahkan dua test case ini dalam describe block yang sama

  it("successfully submits form with 'Berhasil dengan Catatan' result option", async () => {
    const user = userEvent.setup()

    // Mock successful equipment fetch and form submission
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
        json: async () => ({ success: true }),
      })

    render(<MaintenanceHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Pemeliharaan")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Pembersihan komponen internal")
    await user.type(screen.getByLabelText("Teknisi"), "Jane Smith")

    // Select "Berhasil dengan Catatan" result
    const resultSelect = screen.getByText("Pilih hasil")
    await user.click(resultSelect)
    await waitFor(() => {
      expect(screen.getByText("Berhasil dengan Catatan")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Berhasil dengan Catatan"))

    // Select date
    const dateButton = screen.getByText("Pilih tanggal")
    await user.click(dateButton)
    const dateCell = document.querySelector('[role="gridcell"]:not([aria-disabled="true"])')
    if (dateCell) {
      await user.click(dateCell)
    }

    // Submit form
    await user.click(screen.getByText("Simpan"))

    // Verify form submission with correct result value
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
      const lastCallBody = JSON.parse((global.fetch as jest.Mock).mock.calls[1][1].body)
      expect(lastCallBody.result).toBe("Success with Issues")
      expect(toast.success).toHaveBeenCalledWith("Riwayat pemeliharaan berhasil dibuat")
    })
  })

  it("successfully submits form with 'Gagal dengan Catatan' result option", async () => {
    const user = userEvent.setup()

    // Mock successful equipment fetch and form submission
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
        json: async () => ({ success: true }),
      })

    render(<MaintenanceHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Pemeliharaan")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Perbaikan sensor tekanan")
    await user.type(screen.getByLabelText("Teknisi"), "Alex Brown")

    // Select "Gagal dengan Catatan" result
    const resultSelect = screen.getByText("Pilih hasil")
    await user.click(resultSelect)
    await waitFor(() => {
      expect(screen.getByText("Gagal dengan Catatan")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Gagal dengan Catatan"))

    // Select date
    const dateButton = screen.getByText("Pilih tanggal")
    await user.click(dateButton)
    const dateCell = document.querySelector('[role="gridcell"]:not([aria-disabled="true"])')
    if (dateCell) {
      await user.click(dateCell)
    }

    // Submit form
    await user.click(screen.getByText("Simpan"))

    // Verify form submission with correct result value
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
      const lastCallBody = JSON.parse((global.fetch as jest.Mock).mock.calls[1][1].body)
      expect(lastCallBody.result).toBe("Failed with Issues")
      expect(toast.success).toHaveBeenCalledWith("Riwayat pemeliharaan berhasil dibuat")
    })
  })
})
