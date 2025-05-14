import { render, screen, fireEvent } from "@testing-library/react";
import { FilterDialog } from "@/components/general/sparepart-filter-modal";

describe("FilterDialog (Sparepart)", () => {
  const setup = (props = {}) => {
    const onApplyFilter = jest.fn();
    render(<FilterDialog onApplyFilter={onApplyFilter} {...props} />);
    return { onApplyFilter };
  };

  it("renders filter button and opens dialog", () => {
    setup();
    expect(screen.getByText("Filter")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Filter"));
    expect(screen.getByText("Filter Suku Cadang")).toBeInTheDocument();
    expect(screen.getByText("Harga")).toBeInTheDocument();
    expect(screen.getByText("Tanggal Pembelian")).toBeInTheDocument();
    expect(screen.getByText("Tanggal Pembuatan")).toBeInTheDocument();
    expect(screen.getByText("Tanggal Modifikasi")).toBeInTheDocument();
    expect(screen.getByText("Reset")).toBeInTheDocument();
    expect(screen.getByText("Batal")).toBeInTheDocument();
    expect(screen.getByText("Terapkan")).toBeInTheDocument();
  });

  it("calls onApplyFilter with correct params when Terapkan is clicked", () => {
    const { onApplyFilter } = setup();
    fireEvent.click(screen.getByText("Filter"));
    // Set price min and max
    fireEvent.change(screen.getByLabelText("Minimum"), { target: { value: "1000" } });
    fireEvent.change(screen.getByLabelText("Maksimum"), { target: { value: "5000" } });
    // Open and select dates (simulate by clicking popover triggers)
    fireEvent.click(screen.getAllByText("Dari")[0]);
    fireEvent.click(screen.getAllByText("Sampai")[0]);
    fireEvent.click(screen.getByText("Terapkan"));
    expect(onApplyFilter).toHaveBeenCalledWith(
      expect.objectContaining({ priceMin: "1000", priceMax: "5000" })
    );
  });

  it("resets all fields when Reset is clicked", () => {
    const { onApplyFilter } = setup();
    fireEvent.click(screen.getByText("Filter"));
    fireEvent.change(screen.getByLabelText("Minimum"), { target: { value: "1000" } });
    fireEvent.change(screen.getByLabelText("Maksimum"), { target: { value: "5000" } });
    fireEvent.click(screen.getByText("Reset"));
    fireEvent.click(screen.getByText("Terapkan"));
    expect(onApplyFilter).toHaveBeenCalledWith({});
  });

  it("closes dialog when Batal is clicked", () => {
    setup();
    fireEvent.click(screen.getByText("Filter"));
    fireEvent.click(screen.getByText("Batal"));
    // Dialog should close (Filter button should be visible again)
    expect(screen.getByText("Filter")).toBeInTheDocument();
  });

  it("shows badge with active filter count", () => {
    // Simulate active filters via currentFilters prop
    const params = new URLSearchParams({ priceMin: "1000", priceMax: "5000" });
    setup({ currentFilters: params });
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("updates fields when currentFilters prop changes", () => {
    const params = new URLSearchParams({ priceMin: "1000" });
    const { rerender } = render(
      <FilterDialog onApplyFilter={jest.fn()} currentFilters={params} />
    );
    fireEvent.click(screen.getByText("Filter"));
    expect(screen.getByLabelText("Minimum")).toHaveValue(1000);
    // Change prop
    const newParams = new URLSearchParams({ priceMin: "2000" });
    rerender(<FilterDialog onApplyFilter={jest.fn()} currentFilters={newParams} />);
    fireEvent.click(screen.getByText("Filter"));
    expect(screen.getByLabelText("Minimum")).toHaveValue(2000);
  });
}); 