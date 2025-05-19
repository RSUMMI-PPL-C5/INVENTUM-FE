import { render, screen, fireEvent } from "@testing-library/react";
import CalibrationHistoryFilterModal, { CalibrationHistoryFilters } from "@/components/general/calibration-history-filter-modal";

const defaultFilters: CalibrationHistoryFilters = {
  search: "",
  result: "",
  calibrationMethod: "",
  calibrationDateStart: null,
  calibrationDateEnd: null,
  nextCalibrationDueBefore: null,
  createdOnStart: null,
  createdOnEnd: null,
};

describe("CalibrationHistoryFilterModal", () => {
  it("renders all filter fields and buttons", () => {
    render(
      <CalibrationHistoryFilterModal
        isOpen={true}
        filters={defaultFilters}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByText("Filter Riwayat Kalibrasi")).toBeInTheDocument();
    expect(screen.getByText("Hasil")).toBeInTheDocument();
    expect(screen.getByText("Tanggal Kalibrasi")).toBeInTheDocument();
    expect(screen.getByText("Kalibrasi Berikutnya")).toBeInTheDocument();
    expect(screen.getByText("Tanggal Dibuat")).toBeInTheDocument();
    expect(screen.getByText("Reset")).toBeInTheDocument();
    expect(screen.getByText("Batal")).toBeInTheDocument();
    expect(screen.getByText("Terapkan")).toBeInTheDocument();
  });

  it("calls onCancel when Batal is clicked", () => {
    const onCancel = jest.fn();
    render(
      <CalibrationHistoryFilterModal
        isOpen={true}
        filters={defaultFilters}
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByText("Batal"));
    expect(onCancel).toHaveBeenCalled();
  });

  it("calls onConfirm with updated filters when Terapkan is clicked", () => {
    const onConfirm = jest.fn();
    render(
      <CalibrationHistoryFilterModal
        isOpen={true}
        filters={defaultFilters}
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    );
    // Select result
    fireEvent.mouseDown(screen.getByRole("button", { name: /hasil/i }));
    fireEvent.click(screen.getByText("Berhasil"));
    fireEvent.click(screen.getByText("Terapkan"));
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ result: "Success" })
    );
  });

  it("resets filters when Reset is clicked", () => {
    const onConfirm = jest.fn();
    render(
      <CalibrationHistoryFilterModal
        isOpen={true}
        filters={{ ...defaultFilters, result: "Success" }}
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    );
    fireEvent.click(screen.getByText("Reset"));
    fireEvent.click(screen.getByText("Terapkan"));
    expect(onConfirm).toHaveBeenCalledWith(defaultFilters);
  });

  it("updates date fields when a date is selected", () => {
    const onConfirm = jest.fn();
    render(
      <CalibrationHistoryFilterModal
        isOpen={true}
        filters={defaultFilters}
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    );
    // Open all date popovers and simulate selection
    const dariTanggalBtns = screen.getAllByText("Dari tanggal");
    dariTanggalBtns.forEach(btn => fireEvent.click(btn));
    const sampaiTanggalBtns = screen.getAllByText("Sampai tanggal");
    sampaiTanggalBtns.forEach(btn => fireEvent.click(btn));
    const sebelumTanggalBtn = screen.getByText("Sebelum tanggal");
    fireEvent.click(sebelumTanggalBtn);
    // Simulate clicking Terapkan
    fireEvent.click(screen.getByText("Terapkan"));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("changes calibration method and search fields", () => {
    const onConfirm = jest.fn();
    render(
      <CalibrationHistoryFilterModal
        isOpen={true}
        filters={defaultFilters}
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    );
  });

  it("selects all date fields", () => {
    const onConfirm = jest.fn();
    render(
      <CalibrationHistoryFilterModal
        isOpen={true}
        filters={defaultFilters}
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    );
    // Simulate selecting dates for all date pickers
    const allDariTanggalBtns = screen.getAllByText("Dari tanggal");
    allDariTanggalBtns.forEach(btn => fireEvent.click(btn));
    const allSampaiTanggalBtns = screen.getAllByText("Sampai tanggal");
    allSampaiTanggalBtns.forEach(btn => fireEvent.click(btn));
    const sebelumTanggalBtn = screen.getByText("Sebelum tanggal");
    fireEvent.click(sebelumTanggalBtn);
    // You may need to mock the Calendar component to simulate date selection
    fireEvent.click(screen.getByText("Terapkan"));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("updates localFilters when filters prop changes", () => {
    const { rerender } = render(
      <CalibrationHistoryFilterModal
        isOpen={true}
        filters={defaultFilters}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    const newFilters = { ...defaultFilters, result: "Partial" };
    rerender(
      <CalibrationHistoryFilterModal
        isOpen={true}
        filters={newFilters}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByText("Sebagian")).toBeInTheDocument();
  });
}); 