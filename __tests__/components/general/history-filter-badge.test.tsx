import { render, screen, fireEvent } from "@testing-library/react";
import HistoryFilterBadge from "@/components/general/history-filter-badge";

describe("HistoryFilterBadge", () => {
  it("renders nothing if value is null", () => {
    const { container } = render(
      <HistoryFilterBadge label="Label" value={null} onRemove={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders with a string value", () => {
    render(
      <HistoryFilterBadge label="Status" value="Active" onRemove={jest.fn()} />
    );
    expect(screen.getByText("Status:")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders with a Date value and formats it", () => {
    const date = new Date("2024-06-01T00:00:00.000Z");
    render(
      <HistoryFilterBadge label="Tanggal" value={date} onRemove={jest.fn()} />
    );
    expect(screen.getByText("Tanggal:")).toBeInTheDocument();
    expect(screen.getByText("01 Jun 2024")).toBeInTheDocument();
  });

  it("calls onRemove when the button is clicked", () => {
    const onRemove = jest.fn();
    render(
      <HistoryFilterBadge label="Status" value="Active" onRemove={onRemove} />
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onRemove).toHaveBeenCalled();
  });
}); 