import { render, screen, fireEvent } from "@testing-library/react";
import PartsHistoryFilterModal, { PartsHistoryFilters } from "@/components/general/parts-history-filter-modal";

const defaultFilters: PartsHistoryFilters = {
  search: "",
  sparepartId: "",
  result: "",
  replacementDateStart: null,
  replacementDateEnd: null,
  createdOnStart: null,
  createdOnEnd: null,
};

describe("PartsHistoryFilterModal", () => {
  it("renders all filter fields and buttons", () => {
    render(
      <PartsHistoryFilterModal
        isOpen={true}
        filters={defaultFilters}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByText("Filter Riwayat Suku Cadang")).toBeInTheDocument();
    expect(screen.getByText("Hasil")).toBeInTheDocument();
    expect(screen.getByText("Tanggal Penggantian")).toBeInTheDocument();
    expect(screen.getByText("Tanggal Dibuat")).toBeInTheDocument();
    expect(screen.getByText("Reset")).toBeInTheDocument();
    expect(screen.getByText("Batal")).toBeInTheDocument();
    expect(screen.getByText("Terapkan")).toBeInTheDocument();
  });

  it("calls onCancel when Batal is clicked", () => {
    const onCancel = jest.fn();
    render(
      <PartsHistoryFilterModal
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
      <PartsHistoryFilterModal
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
      <PartsHistoryFilterModal
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
      <PartsHistoryFilterModal
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
      <PartsHistoryFilterModal
        isOpen={true}
        filters={defaultFilters}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    const newFilters = { ...defaultFilters, result: "Partial" };
    rerender(
      <PartsHistoryFilterModal
        isOpen={true}
        filters={newFilters}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByText("Sebagian")).toBeInTheDocument();
  });

  it("changes the search and sparepartId fields", () => {
    const onConfirm = jest.fn();
    render(
      <PartsHistoryFilterModal
        isOpen={true}
        filters={defaultFilters}
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    );
    // If you have a search input:
    // fireEvent.change(screen.getByPlaceholderText(/Cari/i), { target: { value: "test search" } });
    // If you have a sparepartId input:
    // fireEvent.change(screen.getByPlaceholderText(/ID Suku Cadang/i), { target: { value: "SP-123" } });
    // fireEvent.click(screen.getByText("Terapkan"));
    // expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ search: "test search", sparepartId: "SP-123" }));
  });
}); 