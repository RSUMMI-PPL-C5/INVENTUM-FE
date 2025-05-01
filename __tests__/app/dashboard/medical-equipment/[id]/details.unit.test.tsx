import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MedicalEquipmentDetails from "@/app/dashboard/medical-equipment/[id]/page";
import { useRouter, useParams } from "next/navigation";
import Cookies from "js-cookie";

jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
    useParams: jest.fn(),
}));
jest.mock("js-cookie", () => ({
    get: jest.fn(),
}));
global.fetch = jest.fn();

describe("MedicalEquipmentDetails", () => {
    const mockPush = jest.fn();

    const mockEquipment = {
        id: "1",
        inventorisId: "INV-001",
        name: "X-Ray Machine",
        brandName: "Siemens",
        modelName: "XR-2000",
        purchaseDate: "2024-01-01T00:00:00.000Z",
        purchasePrice: 150000000,
        status: "active",
        vendor: "Vendor A",
        createdOn: "2024-01-02T00:00:00.000Z",
        modifiedOn: "2024-01-03T00:00:00.000Z",
    };

    const mockMaintenanceHistory = [
        {
            id: "mh1",
            medicalEquipmentId: "1",
            actionPerformed: "Cleaned",
            technician: "Tech A",
            result: "Good",
            maintenanceDate: "2024-04-01T00:00:00.000Z",
            createdBy: "Admin",
            createdOn: "2024-04-01T00:00:00.000Z",
        },
    ];

    const mockCalibrationHistory = [
        {
            id: "ch1",
            medicalEquipmentId: "1",
            actionPerformed: "Calibrated",
            technician: "Tech B",
            result: "OK",
            calibrationDate: "2024-04-02T00:00:00.000Z",
            calibrationMethod: "Standard",
            createdBy: "Admin",
            createdOn: "2024-04-02T00:00:00.000Z",
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({ back: mockPush });
        (useParams as jest.Mock).mockReturnValue({ id: "1" });

        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockEquipment }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockMaintenanceHistory }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockCalibrationHistory }),
            });
    });

    it("should render loading state initially", async () => {
        render(<MedicalEquipmentDetails />);
        expect(screen.getByText("Loading...")).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText("X-Ray Machine")).toBeInTheDocument();
        });
    });

    it("should render equipment details after fetch", async () => {
        render(<MedicalEquipmentDetails />);
        await waitFor(() => {
            expect(screen.getByText("X-Ray Machine")).toBeInTheDocument();
            expect(screen.getByText("Siemens")).toBeInTheDocument();
            expect(screen.getByText("XR-2000")).toBeInTheDocument();
            expect(screen.getByText("Vendor A")).toBeInTheDocument();
        });
    });

    it("should switch to Kalibrasi tab", async () => {
        render(<MedicalEquipmentDetails />);
        await waitFor(() => {
            expect(screen.getByText("X-Ray Machine")).toBeInTheDocument();
        });
        fireEvent.click(screen.getByText("Kalibrasi"));
        expect(await screen.findByText("Calibrated")).toBeInTheDocument();
    });

    it("should handle back button click", async () => {
        render(<MedicalEquipmentDetails />);
        await waitFor(() => {
            expect(screen.getByText("X-Ray Machine")).toBeInTheDocument();
        });
        fireEvent.click(screen.getByRole("button", { name: /kembali/i }));
        expect(mockPush).toHaveBeenCalled();
    });

    it("should render no data if histories empty", async () => {
        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockEquipment }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: [] }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: [] }),
            });

        render(<MedicalEquipmentDetails />);
        await waitFor(() => {
            expect(screen.getByText("Tidak ada data.")).toBeInTheDocument();
        });
    });

    it("should format fallback for invalid dates", async () => {
        const brokenEquipment = { ...mockEquipment, purchaseDate: null };
        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: brokenEquipment }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockMaintenanceHistory }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockCalibrationHistory }),
            });

        render(<MedicalEquipmentDetails />);
        await waitFor(() => {
            expect(screen.getByText("-")).toBeInTheDocument();
        });
    });

    it("should handle fetch error", async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Fetch Error"));
        render(<MedicalEquipmentDetails />);
        await waitFor(() => {
            expect(screen.getByText("Loading...")).toBeInTheDocument();
        });
    });

    it("should paginate correctly", async () => {
        const longMaintenance = Array.from({ length: 12 }, (_, i) => ({
            id: `mh${i}`,
            medicalEquipmentId: "1",
            actionPerformed: `Action ${i}`,
            technician: `Tech ${i}`,
            result: `Result ${i}`,
            maintenanceDate: "2024-04-01T00:00:00.000Z",
            createdBy: "Admin",
            createdOn: "2024-04-01T00:00:00.000Z",
        }));

        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockEquipment }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: longMaintenance }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: [] }),
            });

        render(<MedicalEquipmentDetails />);
        await waitFor(() => {
            expect(screen.getByText("Action 0")).toBeInTheDocument();
        });
        fireEvent.click(screen.getByRole("button", { name: /next/i }));
    });

    it("should display fallback if equipment is null", async () => {
        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: null }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: [] }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: [] }),
            });

        render(<MedicalEquipmentDetails />);
        await waitFor(() => {
            expect(screen.getByText("Alat tidak ditemukan.")).toBeInTheDocument();
        });
    });

    it("should fallback to '-' if price is null", async () => {
        const nullPriceEquipment = { ...mockEquipment, purchasePrice: null };
        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: nullPriceEquipment }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: [] }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: [] }),
            });

        render(<MedicalEquipmentDetails />);
        await waitFor(() => {
            expect(screen.getByText("-")).toBeInTheDocument();
        });
    });

    it("should fallback to '-' if purchaseDate is null", async () => {
        const nullDateEquipment = { ...mockEquipment, purchaseDate: null };
        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: nullDateEquipment }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: [] }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: [] }),
            });

        render(<MedicalEquipmentDetails />);
        await waitFor(() => {
            expect(screen.getAllByText("-")[0]).toBeInTheDocument();
        });
    });

    it("should show toast error when fetchHistories fails", async () => {
        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockEquipment }),
            })
            .mockRejectedValueOnce(new Error("fetch error"));

        render(<MedicalEquipmentDetails />);
        await waitFor(() => {
            expect(screen.getByText("X-Ray Machine")).toBeInTheDocument();
        });
    });

    it("should trigger Minta Maintenance button click", async () => {
        render(<MedicalEquipmentDetails />);
        await waitFor(() => {
            expect(screen.getByText("Minta Maintenance")).toBeInTheDocument();
        });
        fireEvent.click(screen.getByText("Minta Maintenance"));
    });

    it("should trigger Minta Kalibrasi button click", async () => {
        render(<MedicalEquipmentDetails />);
        await waitFor(() => {
            expect(screen.getByText("Minta Kalibrasi")).toBeInTheDocument();
        });
        fireEvent.click(screen.getByText("Minta Kalibrasi"));
    });

    it("should go to previous page in pagination", async () => {
        const longMaintenance = Array.from({ length: 12 }, (_, i) => ({
            id: `mh${i}`,
            medicalEquipmentId: "1",
            actionPerformed: `Action ${i}`,
            technician: `Tech ${i}`,
            result: `Result ${i}`,
            maintenanceDate: "2024-04-01T00:00:00.000Z",
            createdBy: "Admin",
            createdOn: "2024-04-01T00:00:00.000Z",
        }));

        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockEquipment }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: longMaintenance }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: [] }),
            });

        render(<MedicalEquipmentDetails />);
        await waitFor(() => {
            expect(screen.getByText("Action 0")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: /next/i }));
        fireEvent.click(screen.getByRole("button", { name: /previous/i }));
    });
});
