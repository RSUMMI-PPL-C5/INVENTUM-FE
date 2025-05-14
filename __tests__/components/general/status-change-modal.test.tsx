import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import StatusChangeModal from "@/components/general/status-change-modal";

describe("StatusChangeModal", () => {
  const baseProps = {
    open: true,
    onOpenChange: jest.fn(),
    currentStatus: "Pending",
    onConfirm: jest.fn().mockResolvedValue(undefined),
    isUpdating: false,
    title: "Ubah Status Permintaan",
  };

  it("renders with all status options and correct title", () => {
    render(<StatusChangeModal {...baseProps} />);
    expect(screen.getByText("Ubah Status Permintaan")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("On Progress")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Batal")).toBeInTheDocument();
    expect(screen.getByText("Simpan")).toBeInTheDocument();
  });

  it("calls onOpenChange(false) when Batal is clicked", () => {
    render(<StatusChangeModal {...baseProps} />);
    fireEvent.click(screen.getByText("Batal"));
    expect(baseProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls onConfirm with selected status when Simpan is clicked", async () => {
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    render(<StatusChangeModal {...baseProps} onConfirm={onConfirm} />);
    // Change status
    fireEvent.mouseDown(screen.getByRole("button", { name: /pilih status/i }));
    fireEvent.click(screen.getByText("On Progress"));
    fireEvent.click(screen.getByText("Simpan"));
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith("On Progress");
    });
  });

  it("disables Simpan button if status is unchanged", () => {
    render(<StatusChangeModal {...baseProps} />);
    expect(screen.getByText("Simpan")).toBeDisabled();
  });

  it("shows loading state when isUpdating is true", () => {
    render(<StatusChangeModal {...baseProps} isUpdating={true} />);
    expect(screen.getByText("Menyimpan...")).toBeInTheDocument();
    expect(screen.getByText("Batal")).toBeDisabled();
  });

  it("renders with a custom title", () => {
    render(<StatusChangeModal {...baseProps} title="Custom Title" />);
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
  });

  it("changes status and disables Simpan if isUpdating", () => {
    render(<StatusChangeModal {...baseProps} isUpdating={true} />);
    fireEvent.mouseDown(screen.getByRole("button", { name: /pilih status/i }));
    fireEvent.click(screen.getByText("Completed"));
    expect(screen.getByText("Menyimpan...")).toBeInTheDocument();
    expect(screen.getByText("Batal")).toBeDisabled();
  });
}); 