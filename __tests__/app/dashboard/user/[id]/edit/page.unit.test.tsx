import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import UserEdit from "@/app/dashboard/user/[id]/edit/page";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("UserEdit Component", () => {
  let mockPush: jest.Mock;
  let mockBack: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    mockBack = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: mockBack });
  });

  test("renders the form correctly", () => {
    render(<UserEdit />);

    expect(screen.getByText("Ubah Pengguna")).toBeInTheDocument();
    expect(screen.getByLabelText("No. Karyawan")).toBeInTheDocument();
    expect(screen.getByLabelText("Nama Lengkap")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByText("Divisi")).toBeInTheDocument();
    expect(screen.getByLabelText("Role")).toBeInTheDocument();
    expect(screen.getByLabelText("No. WA")).toBeInTheDocument();
    expect(screen.getByText("Tanggal Masuk")).toBeInTheDocument();
  });

  test("validates required fields", async () => {
    render(<UserEdit />);

    // Clear required fields
    fireEvent.change(screen.getByLabelText("Nama Lengkap"), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText("No. WA"), { target: { value: '' } });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: /simpan/i }));
    });

    expect(screen.getByText("Nama lengkap wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Password wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("No. WA wajib diisi")).toBeInTheDocument();
  });

  test("submits the form with valid data", async () => {
    render(<UserEdit />);

    fireEvent.change(screen.getByLabelText("Nama Lengkap"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "securepassword" },
    });
    fireEvent.change(screen.getByLabelText("No. WA"), {
      target: { value: "08123456789" },
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: /simpan/i }));
    });

    expect(mockPush).toHaveBeenCalledWith("/users");
  });

  test("clicking cancel button navigates back", () => {
    render(<UserEdit />);

    fireEvent.click(screen.getByRole("button", { name: /batalkan/i }));
    expect(mockBack).toHaveBeenCalled();
  });

  test("displays correct role name", () => {
    render(<UserEdit />);

    expect(screen.getByLabelText("Role")).toHaveValue("User");
  });

  test("displays empty role name for invalid role id", () => {
    render(<UserEdit />);

    // Change the role id to an invalid value
    fireEvent.change(screen.getByLabelText("Role"), {
      target: { value: "invalid_role_id" },
    });

    expect(screen.getByLabelText("Role")).toHaveValue("");
  });

  test("does not submit the form when required fields are missing", async () => {
    render(<UserEdit />);

    // Clear required fields
    fireEvent.change(screen.getByLabelText("Nama Lengkap"), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText("No. WA"), { target: { value: '' } });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: /simpan/i }));
    });

    expect(mockPush).not.toHaveBeenCalled();
  });
});