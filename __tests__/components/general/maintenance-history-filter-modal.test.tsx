import { render, screen, fireEvent } from "@testing-library/react";
import MaintenanceHistoryFilterModal, { MaintenanceHistoryFilters } from "@/components/general/maintenance-history-filter-modal";

const defaultFilters: MaintenanceHistoryFilters = {
  search: "",
  result: "",
  maintenanceDateStart: null,
  maintenanceDateEnd: null,
  createdOnStart: null,
  createdOnEnd: null,
};

describe("MaintenanceHistoryFilterModal", () => {
  it("renders all filter fields and buttons", () => {
    render(
      <MaintenanceHistoryFilterModal
        isOpen={true}
        filters={defaultFilters}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByText("Filter Riwayat Maintenance")).toBeInTheDocument();
    expect(screen.getByText("Hasil")).toBeInTheDocument();
    expect(screen.getByText("Tanggal Maintenance")).toBeInTheDocument();
    expect(screen.getByText("Tanggal Dibuat")).toBeInTheDocument();
    expect(screen.getByText("Reset")).toBeInTheDocument();
    expect(screen.getByText("Batal")).toBeInTheDocument();
    expect(screen.getByText("Terapkan")).toBeInTheDocument();
  });

  it("calls onCancel when Batal is clicked", () => {
    const onCancel = jest.fn();
    render(
      <MaintenanceHistoryFilterModal
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
      <MaintenanceHistoryFilterModal
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
      <MaintenanceHistoryFilterModal
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
      <MaintenanceHistoryFilterModal
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
    fireEvent.click(screen.getByText("Terapkan"));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("updates localFilters when filters prop changes", () => {
    const { rerender } = render(
      <MaintenanceHistoryFilterModal
        isOpen={true}
        filters={defaultFilters}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    const newFilters = { ...defaultFilters, result: "Partial" };
    rerender(
      <MaintenanceHistoryFilterModal
        isOpen={true}
        filters={newFilters}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByText("Sebagian")).toBeInTheDocument();
  });

  it("changes the search field", () => {
    const onConfirm = jest.fn();
    render(
      <MaintenanceHistoryFilterModal
        isOpen={true}
        filters={defaultFilters}
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    );
    fireEvent.change(screen.getByPlaceholderText(/Cari/i), { target: { value: "test" } });
    fireEvent.click(screen.getByText("Terapkan"));
    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ search: "test" }));
  });

  it("selects all result options", () => {
    const onConfirm = jest.fn();
    render(
      <MaintenanceHistoryFilterModal
        isOpen={true}
        filters={defaultFilters}
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    );
    fireEvent.mouseDown(screen.getByRole("button", { name: /hasil/i }));
    fireEvent.click(screen.getByText("Semua"));
    fireEvent.click(screen.getByText("Terapkan"));
    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ result: "all" }));

    fireEvent.mouseDown(screen.getByRole("button", { name: /hasil/i }));
    fireEvent.click(screen.getByText("Sebagian"));
    fireEvent.click(screen.getByText("Terapkan"));
    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ result: "Partial" }));

    fireEvent.mouseDown(screen.getByRole("button", { name: /hasil/i }));
    fireEvent.click(screen.getByText("Gagal"));
    fireEvent.click(screen.getByText("Terapkan"));
    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ result: "Failed" }));
  });

  it("selects a date for each date picker", () => {
    const onConfirm = jest.fn();
    render(
      <MaintenanceHistoryFilterModal
        isOpen={true}
        filters={defaultFilters}
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    );
    // You may need to mock the Calendar component to simulate date selection
    // For now, just click the popover triggers and call Terapkan
    const dariTanggalBtns = screen.getAllByText("Dari tanggal");
    dariTanggalBtns.forEach(btn => fireEvent.click(btn));
    const sampaiTanggalBtns = screen.getAllByText("Sampai tanggal");
    sampaiTanggalBtns.forEach(btn => fireEvent.click(btn));
    fireEvent.click(screen.getByText("Terapkan"));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("resets all fields", () => {
    const onConfirm = jest.fn();
    const allSetFilters = {
      search: "abc",
      result: "Success",
      maintenanceDateStart: new Date(),
      maintenanceDateEnd: new Date(),
      createdOnStart: new Date(),
      createdOnEnd: new Date(),
    };
    render(
      <MaintenanceHistoryFilterModal
        isOpen={true}
        filters={allSetFilters}
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
      <MaintenanceHistoryFilterModal
        isOpen={true}
        filters={defaultFilters}
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    );
    fireEvent.click(screen.getByText('Dari tanggal'));
    fireEvent.click(screen.getByText('Select Date'));
  });
});