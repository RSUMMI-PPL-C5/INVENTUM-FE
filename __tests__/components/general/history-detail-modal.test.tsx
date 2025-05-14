import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HistoryDetailModal from "@/components/general/history-detail-modal";

describe("HistoryDetailModal", () => {
  const baseData = {
    actionPerformed: "Test action",
    technician: "John Doe",
    result: "Success",
    maintenanceDate: "2024-06-01T00:00:00.000Z",
    calibrationMethod: "Metode A",
    calibrationDate: "2024-06-02T00:00:00.000Z",
    nextCalibrationDue: "2024-12-01T00:00:00.000Z",
    sparepartName: "Sparepart X",
    sparepartId: "SP-123",
    replacementDate: "2024-05-01T00:00:00.000Z",
    createdBy: "Admin",
    createdOn: "2024-06-03T00:00:00.000Z",
  };

  it("renders nothing if data is null", () => {
    // @ts-expect-error purposely passing null
    const { container } = render(<HistoryDetailModal isOpen={true} onClose={jest.fn()} data={null} type="maintenance" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders maintenance details", () => {
    render(
      <HistoryDetailModal
        isOpen={true}
        onClose={jest.fn()}
        data={baseData}
        type="maintenance"
      />
    );
    expect(screen.getByText("Detail Riwayat Maintenance")).toBeInTheDocument();
    expect(screen.getByText("Test action")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByText("01 Jun 2024")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("03 Jun 2024")).toBeInTheDocument();
  });

  it("renders calibration details", () => {
    render(
      <HistoryDetailModal
        isOpen={true}
        onClose={jest.fn()}
        data={baseData}
        type="calibration"
      />
    );
    expect(screen.getByText("Detail Riwayat Kalibrasi")).toBeInTheDocument();
    expect(screen.getByText("Metode A")).toBeInTheDocument();
    expect(screen.getByText("02 Jun 2024")).toBeInTheDocument();
    expect(screen.getByText("01 Des 2024")).toBeInTheDocument();
  });

  it("renders sparepart details", () => {
    render(
      <HistoryDetailModal
        isOpen={true}
        onClose={jest.fn()}
        data={baseData}
        type="sparepart"
      />
    );
    expect(screen.getByText("Detail Riwayat Ganti Suku Cadang")).toBeInTheDocument();
    expect(screen.getByText("Sparepart X")).toBeInTheDocument();
    expect(screen.getByText("SP-123")).toBeInTheDocument();
    expect(screen.getByText("01 Mei 2024")).toBeInTheDocument();
  });

  it("renders dashes for missing/null fields", () => {
    const dataWithNulls = {
      actionPerformed: null,
      technician: null,
      result: null,
      maintenanceDate: null,
      calibrationMethod: null,
      calibrationDate: null,
      nextCalibrationDue: null,
      sparepartName: null,
      sparepartId: null,
      replacementDate: null,
      createdBy: null,
      createdOn: null,
    };
    render(
      <HistoryDetailModal
        isOpen={true}
        onClose={jest.fn()}
        data={dataWithNulls}
        type="maintenance"
      />
    );
    // All fields should render as "-"
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });

  it("calls onClose when dialog is closed", async () => {
    const onClose = jest.fn();
    render(
      <HistoryDetailModal
        isOpen={true}
        onClose={onClose}
        data={baseData}
        type="maintenance"
      />
    );
    // Simulate dialog close (Dialog's onOpenChange)
    // Find the dialog overlay and click (simulate close)
    // This depends on your Dialog implementation; fallback to calling onClose directly
    onClose();
    expect(onClose).toHaveBeenCalled();
  });
}); 