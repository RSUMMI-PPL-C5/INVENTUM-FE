import { render, screen, fireEvent } from "@testing-library/react";
import RequestFilterModal, { RequestFilters } from "@/components/general/request-filter-modal";

const defaultFilters: RequestFilters = {
  status: [],
  createdOnStart: null,
  createdOnEnd: null,
  modifiedOnStart: null,
  modifiedOnEnd: null,
};

describe("RequestFilterModal", () => {
  it("renders all filter fields and buttons", () => {
    render(
      <RequestFilterModal
        isOpen={true}
        filters={defaultFilters}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByText("Filter Request")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Tanggal Pembuatan")).toBeInTheDocument();
    expect(screen.getByText("Tanggal Modifikasi")).toBeInTheDocument();
    expect(screen.getByText("Reset")).toBeInTheDocument();
    expect(screen.getByText("Batal")).toBeInTheDocument();
    expect(screen.getByText("Terapkan")).toBeInTheDocument();
  });

  it("calls onCancel when Batal is clicked", () => {
    const onCancel = jest.fn();
    render(
      <RequestFilterModal
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
      <RequestFilterModal
        isOpen={true}
        filters={defaultFilters}
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    );
    // Toggle status checkboxes
    fireEvent.click(screen.getByLabelText("Pending"));
    fireEvent.click(screen.getByText("Terapkan"));
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ status: ["Pending"] })
    );
  });

  it("resets filters when Reset is clicked", () => {
    const onConfirm = jest.fn();
    render(
      <RequestFilterModal
        isOpen={true}
        filters={{ ...defaultFilters, status: ["Pending"] }}
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
      <RequestFilterModal
        isOpen={true}
        filters={defaultFilters}
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    );
    // Open all date popovers and simulate selection
    const dariBtns = screen.getAllByText("Dari");
    dariBtns.forEach(btn => fireEvent.click(btn));
    const sampaiBtns = screen.getAllByText("Sampai");
    sampaiBtns.forEach(btn => fireEvent.click(btn));
    fireEvent.click(screen.getByText("Terapkan"));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("updates localFilters when filters prop changes", () => {
    const { rerender } = render(
      <RequestFilterModal
        isOpen={true}
        filters={defaultFilters}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    const newFilters = { ...defaultFilters, status: ["Completed"] };
    rerender(
      <RequestFilterModal
        isOpen={true}
        filters={newFilters}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByLabelText("Completed")).toBeChecked();
  });

  it("toggles multiple status checkboxes", () => {
    const onConfirm = jest.fn();
    render(
      <RequestFilterModal
        isOpen={true}
        filters={defaultFilters}
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    );
    fireEvent.click(screen.getByLabelText("Pending"));
    fireEvent.click(screen.getByLabelText("On Progress"));
    fireEvent.click(screen.getByText("Terapkan"));
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ status: ["Pending", "On Progress"] })
    );
  });
}); 