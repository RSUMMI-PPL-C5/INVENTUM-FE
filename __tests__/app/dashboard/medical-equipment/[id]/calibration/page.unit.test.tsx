import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useRouter, useParams } from "next/navigation"
import CalibrationHistoryCreate from "@/app/dashboard/medical-equipment/[id]/calibration/page"
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

describe("CalibrationHistoryCreate Component", () => {
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
    render(<CalibrationHistoryCreate />)

    // Wait for equipment data to load
    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Kalibrasi")).toBeInTheDocument()
      expect(screen.getByText("MRI Machine - GE Model X")).toBeInTheDocument()
    })

    // Check form fields
    expect(screen.getByLabelText("Tindakan yang Dilakukan")).toBeInTheDocument()
    expect(screen.getByLabelText("Teknisi")).toBeInTheDocument()
    expect(screen.getByText("Hasil")).toBeInTheDocument()
    expect(screen.getByLabelText("Metode Kalibrasi")).toBeInTheDocument()
    expect(screen.getByText("Tanggal Kalibrasi")).toBeInTheDocument()
    expect(screen.getByText("Tanggal Jatuh Tempo Kalibrasi Berikutnya (Opsional)")).toBeInTheDocument()

    // Check buttons
    expect(screen.getByText("Kembali")).toBeInTheDocument()
    expect(screen.getByText("Simpan")).toBeInTheDocument()
    expect(screen.getByText("Batal")).toBeInTheDocument()
  })

  it("navigates back when back button is clicked", async () => {
    render(<CalibrationHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Kalibrasi")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText("Kembali"))
    expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/medical-equipment/test-equipment-id")
  })

  it("navigates back when cancel button is clicked", async () => {
    render(<CalibrationHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Kalibrasi")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText("Batal"))
    expect(mockRouter.back).toHaveBeenCalled()
  })

  it("shows validation errors when form is submitted with empty fields", async () => {
    render(<CalibrationHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Kalibrasi")).toBeInTheDocument()
    })

    // Submit empty form
    fireEvent.click(screen.getByText("Simpan"))

    // Check validation errors
    await waitFor(() => {
      expect(screen.getByText("Tindakan yang dilakukan wajib diisi")).toBeInTheDocument()
      expect(screen.getByText("Nama teknisi wajib diisi")).toBeInTheDocument()
      expect(screen.getByText("Hasil wajib diisi")).toBeInTheDocument()
      expect(screen.getByText("Metode kalibrasi wajib diisi")).toBeInTheDocument()
      expect(screen.getByText("Tanggal kalibrasi wajib diisi")).toBeInTheDocument()
    })
  })

  it("successfully submits the form with valid data (without optional next calibration date)", async () => {
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

    render(<CalibrationHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Kalibrasi")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Kalibrasi sensor")
    await user.type(screen.getByLabelText("Teknisi"), "John Doe")
    await user.type(screen.getByLabelText("Metode Kalibrasi"), "Standard ISO 13485")

    // Select result
    const resultSelect = screen.getByText("Pilih hasil")
    await user.click(resultSelect)
    await waitFor(() => {
      expect(screen.getByText("Berhasil")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Berhasil"))

    // Select calibration date
    const dateButtons = screen.getAllByText("Pilih tanggal")
    await user.click(dateButtons[0]) // First date button is for calibration date

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
        `${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/test-equipment-id/calibration-history`,
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
        actionPerformed: "Kalibrasi sensor",
        technician: "John Doe",
        result: "Success",
        calibrationDate: expect.any(String),
        calibrationMethod: "Standard ISO 13485",
        nextCalibrationDue: undefined,
      })

      expect(toast.success).toHaveBeenCalledWith("Riwayat kalibrasi berhasil dibuat")
      expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/medical-equipment/test-equipment-id")
    })
  })

  it("successfully submits the form with valid data (including optional next calibration date)", async () => {
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

    render(<CalibrationHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Kalibrasi")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Kalibrasi sensor")
    await user.type(screen.getByLabelText("Teknisi"), "John Doe")
    await user.type(screen.getByLabelText("Metode Kalibrasi"), "Standard ISO 13485")

    // Select result
    const resultSelect = screen.getByText("Pilih hasil")
    await user.click(resultSelect)
    await waitFor(() => {
      expect(screen.getByText("Berhasil")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Berhasil"))

    // Select calibration date
    const dateButtons = screen.getAllByText("Pilih tanggal")
    await user.click(dateButtons[0]) // First date button is for calibration date

    // Click on a date in the calendar
    let dateCell = document.querySelector('[role="gridcell"]:not([aria-disabled="true"])')
    if (dateCell) {
      await user.click(dateCell)
    }

    // Select next calibration date
    await user.click(dateButtons[1]) // Second date button is for next calibration date

    // Click on a future date in the calendar
    dateCell = document.querySelector('[role="gridcell"]:not([aria-disabled="true"])')
    if (dateCell) {
      await user.click(dateCell)
    }

    // Submit form
    await user.click(screen.getByText("Simpan"))

    // Verify form submission
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
      expect(global.fetch).toHaveBeenLastCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/test-equipment-id/calibration-history`,
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
        actionPerformed: "Kalibrasi sensor",
        technician: "John Doe",
        result: "Success",
        calibrationDate: expect.any(String),
        calibrationMethod: "Standard ISO 13485",
        nextCalibrationDue: expect.any(String),
      })

      expect(toast.success).toHaveBeenCalledWith("Riwayat kalibrasi berhasil dibuat")
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

    render(<CalibrationHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Gagal memuat detail peralatan medis.")).toBeInTheDocument()
    })
  })

  it("handles network error when fetching equipment", async () => {
    // Reset fetch mock to throw error for equipment fetch
    ;(global.fetch as jest.Mock).mockReset()
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"))

    render(<CalibrationHistoryCreate />)

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
        json: async () => ({ message: "Error creating calibration history" }),
      })

    render(<CalibrationHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Kalibrasi")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Kalibrasi sensor")
    await user.type(screen.getByLabelText("Teknisi"), "John Doe")
    await user.type(screen.getByLabelText("Metode Kalibrasi"), "Standard ISO 13485")

    // Select result
    const resultSelect = screen.getByText("Pilih hasil")
    await user.click(resultSelect)
    await waitFor(() => {
      expect(screen.getByText("Berhasil")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Berhasil"))

    // Select calibration date
    const dateButtons = screen.getAllByText("Pilih tanggal")
    await user.click(dateButtons[0])

    // Click on a date in the calendar
    const dateCell = document.querySelector('[role="gridcell"]:not([aria-disabled="true"])')
    if (dateCell) {
      await user.click(dateCell)
    }

    // Submit form
    await user.click(screen.getByText("Simpan"))

    // Verify error handling
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error membuat riwayat kalibrasi", "Error creating calibration history")
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

    render(<CalibrationHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Kalibrasi")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Kalibrasi sensor")
    await user.type(screen.getByLabelText("Teknisi"), "John Doe")
    await user.type(screen.getByLabelText("Metode Kalibrasi"), "Standard ISO 13485")

    // Select result
    const resultSelect = screen.getByText("Pilih hasil")
    await user.click(resultSelect)
    await waitFor(() => {
      expect(screen.getByText("Berhasil")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Berhasil"))

    // Select calibration date
    const dateButtons = screen.getAllByText("Pilih tanggal")
    await user.click(dateButtons[0])

    // Click on a date in the calendar
    const dateCell = document.querySelector('[role="gridcell"]:not([aria-disabled="true"])')
    if (dateCell) {
      await user.click(dateCell)
    }

    // Submit form
    await user.click(screen.getByText("Simpan"))

    // Verify error handling
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Network error")
      expect(screen.getByText("Gagal membuat riwayat kalibrasi. Silakan coba lagi.")).toBeInTheDocument()
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

    render(<CalibrationHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Kalibrasi")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Kalibrasi sensor")
    await user.type(screen.getByLabelText("Teknisi"), "John Doe")
    await user.type(screen.getByLabelText("Metode Kalibrasi"), "Standard ISO 13485")

    // Select result
    const resultSelect = screen.getByText("Pilih hasil")
    await user.click(resultSelect)
    await waitFor(() => {
      expect(screen.getByText("Berhasil")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Berhasil"))

    // Select calibration date
    const dateButtons = screen.getAllByText("Pilih tanggal")
    await user.click(dateButtons[0])

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
      expect(toast.success).toHaveBeenCalledWith("Riwayat kalibrasi berhasil dibuat")
    })
  })

  it("handles error in createCalibrationHistory function", async () => {
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

    render(<CalibrationHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Kalibrasi")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Kalibrasi sensor")
    await user.type(screen.getByLabelText("Teknisi"), "John Doe")
    await user.type(screen.getByLabelText("Metode Kalibrasi"), "Standard ISO 13485")

    // Select result
    const resultSelect = screen.getByText("Pilih hasil")
    await user.click(resultSelect)
    await waitFor(() => {
      expect(screen.getByText("Berhasil")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Berhasil"))

    // Select calibration date
    const dateButtons = screen.getAllByText("Pilih tanggal")
    await user.click(dateButtons[0])

    // Click on a date in the calendar
    const dateCell = document.querySelector('[role="gridcell"]:not([aria-disabled="true"])')
    if (dateCell) {
      await user.click(dateCell)
    }

    // Submit form
    await user.click(screen.getByText("Simpan"))

    // Verify error handling
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error membuat riwayat kalibrasi", "Error message")
    })
  })

  it("handles non-Error object in createCalibrationHistory catch block", async () => {
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

    render(<CalibrationHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Kalibrasi")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Kalibrasi sensor")
    await user.type(screen.getByLabelText("Teknisi"), "John Doe")
    await user.type(screen.getByLabelText("Metode Kalibrasi"), "Standard ISO 13485")

    // Select result
    const resultSelect = screen.getByText("Pilih hasil")
    await user.click(resultSelect)
    await waitFor(() => {
      expect(screen.getByText("Berhasil")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Berhasil"))

    // Select calibration date
    const dateButtons = screen.getAllByText("Pilih tanggal")
    await user.click(dateButtons[0])

    // Click on a date in the calendar
    const dateCell = document.querySelector('[role="gridcell"]:not([aria-disabled="true"])')
    if (dateCell) {
      await user.click(dateCell)
    }

    // Submit form
    await user.click(screen.getByText("Simpan"))

    // Verify error handling
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error membuat riwayat kalibrasi")
    })
  })

  it("handles successful API response in createCalibrationHistory function", async () => {
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
            id: "new-calibration-id",
            medicalEquipmentId: "test-equipment-id",
            actionPerformed: "Kalibrasi sensor",
            technician: "John Doe",
            result: "Success",
            calibrationDate: "2025-01-01T00:00:00.000Z",
            calibrationMethod: "Standard ISO 13485",
            nextCalibrationDue: null,
          },
        }),
      })

    render(<CalibrationHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Kalibrasi")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Kalibrasi sensor")
    await user.type(screen.getByLabelText("Teknisi"), "John Doe")
    await user.type(screen.getByLabelText("Metode Kalibrasi"), "Standard ISO 13485")

    // Select result
    const resultSelect = screen.getByText("Pilih hasil")
    await user.click(resultSelect)
    await waitFor(() => {
      expect(screen.getByText("Berhasil")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Berhasil"))

    // Select calibration date
    const dateButtons = screen.getAllByText("Pilih tanggal")
    await user.click(dateButtons[0])

    // Click on a date in the calendar
    const dateCell = document.querySelector('[role="gridcell"]:not([aria-disabled="true"])')
    if (dateCell) {
      await user.click(dateCell)
    }

    // Submit form
    await user.click(screen.getByText("Simpan"))

    // Verify successful submission and return value
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Riwayat kalibrasi berhasil dibuat")
      expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/medical-equipment/test-equipment-id")
    })
  })

  it("handles error thrown in onSubmit function", async () => {
    const user = userEvent.setup()

    // Mock successful equipment fetch but createCalibrationHistory throws an error
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

    // Mock createCalibrationHistory to throw an error
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
    const originalFetch = global.fetch
    global.fetch = jest.fn().mockImplementation(() => {
      throw new Error("Test error in onSubmit")
    })

    render(<CalibrationHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Kalibrasi")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Kalibrasi sensor")
    await user.type(screen.getByLabelText("Teknisi"), "John Doe")
    await user.type(screen.getByLabelText("Metode Kalibrasi"), "Standard ISO 13485")

    // Select result
    const resultSelect = screen.getByText("Pilih hasil")
    await user.click(resultSelect)
    await waitFor(() => {
      expect(screen.getByText("Berhasil")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Berhasil"))

    // Select calibration date
    const dateButtons = screen.getAllByText("Pilih tanggal")
    await user.click(dateButtons[0])

    // Click on a date in the calendar
    const dateCell = document.querySelector('[role="gridcell"]:not([aria-disabled="true"])')
    if (dateCell) {
      await user.click(dateCell)
    }

    // Submit form
    await user.click(screen.getByText("Simpan"))

    // Verify error handling in onSubmit
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to create calibration history:", expect.any(Error))
      expect(screen.getByText("Gagal membuat riwayat kalibrasi. Silakan coba lagi.")).toBeInTheDocument()
    })

    // Restore original implementations
    global.fetch = originalFetch
    consoleErrorSpy.mockRestore()
  })

  it("handles case when accessToken is not available", async () => {
    const user = userEvent.setup()

    // Mock no access token
    ;(Cookies.get as jest.Mock).mockReturnValue(null)

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

    render(<CalibrationHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Kalibrasi")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Kalibrasi sensor")
    await user.type(screen.getByLabelText("Teknisi"), "John Doe")
    await user.type(screen.getByLabelText("Metode Kalibrasi"), "Standard ISO 13485")

    // Select result
    const resultSelect = screen.getByText("Pilih hasil")
    await user.click(resultSelect)
    await waitFor(() => {
      expect(screen.getByText("Berhasil")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Berhasil"))

    // Select calibration date
    const dateButtons = screen.getAllByText("Pilih tanggal")
    await user.click(dateButtons[0])

    // Click on a date in the calendar
    const dateCell = document.querySelector('[role="gridcell"]:not([aria-disabled="true"])')
    if (dateCell) {
      await user.click(dateCell)
    }

    // Submit form
    await user.click(screen.getByText("Simpan"))

    // Verify form submission with empty Authorization header
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
      expect(global.fetch).toHaveBeenLastCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/test-equipment-id/calibration-history`,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "",
          }),
          body: expect.any(String),
        }),
      )
    })
  })

  it("ensures loading state is reset after error in onSubmit", async () => {
    const user = userEvent.setup()

    // Mock successful equipment fetch but createCalibrationHistory throws an error
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

    // Mock createCalibrationHistory to throw an error
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
    const originalFetch = global.fetch
    global.fetch = jest.fn().mockImplementation(() => {
      throw new Error("Test error in onSubmit")
    })

    render(<CalibrationHistoryCreate />)

    await waitFor(() => {
      expect(screen.getByText("Tambah Riwayat Kalibrasi")).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText("Tindakan yang Dilakukan"), "Kalibrasi sensor")
    await user.type(screen.getByLabelText("Teknisi"), "John Doe")
    await user.type(screen.getByLabelText("Metode Kalibrasi"), "Standard ISO 13485")

    // Select result
    const resultSelect = screen.getByText("Pilih hasil")
    await user.click(resultSelect)
    await waitFor(() => {
      expect(screen.getByText("Berhasil")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Berhasil"))

    // Select calibration date
    const dateButtons = screen.getAllByText("Pilih tanggal")
    await user.click(dateButtons[0])

    // Click on a date in the calendar
    const dateCell = document.querySelector('[role="gridcell"]:not([aria-disabled="true"])')
    if (dateCell) {
      await user.click(dateCell)
    }

    // Submit form
    await user.click(screen.getByText("Simpan"))

    // Verify loading state is reset after error
    await waitFor(() => {
      // Check that the loading state is reset (button is not disabled)
      expect(screen.getByText("Simpan")).not.toBeDisabled()
      expect(screen.queryByText("Menyimpan...")).not.toBeInTheDocument()
    })

    // Restore original implementations
    global.fetch = originalFetch
    consoleErrorSpy.mockRestore()
  })
})
