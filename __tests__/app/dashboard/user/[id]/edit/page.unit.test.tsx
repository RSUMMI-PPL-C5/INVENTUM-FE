import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";
import UserEdit from "@/modules/user/user-edit";
import { useRouter, useParams } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

describe("UserEdit Component", () => {
  let mockPush: jest.Mock;
  let mockBack: jest.Mock;
  let mockUseParams: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    mockBack = jest.fn();
    mockUseParams = jest.fn().mockReturnValue({ id: "1" });
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: mockBack });
    (useParams as jest.Mock).mockImplementation(mockUseParams);

    // Mock fetch API
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url === "http://localhost:8000/user/1") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            nokar: "12345",
            fullname: "Test User",
            username: "testuser",
            divisiId: "1",
            role: "1",
            waNumber: "08123456789",
            createdOn: "2025-02-12T00:00:00.000Z",
          }),
        });
      }
      return Promise.reject(new Error("Failed to fetch"));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders the form correctly", async () => {
    await act(async () => {
      render(<UserEdit />);
    });

    expect(screen.getByText("Ubah Pengguna")).toBeInTheDocument();
    expect(screen.getByLabelText("No. Karyawan")).toBeInTheDocument();
    expect(screen.getByLabelText("Nama Lengkap")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByText("Divisi")).toBeInTheDocument();
    expect(screen.getByLabelText("Role")).toBeInTheDocument();
    expect(screen.getByLabelText("No. WA")).toBeInTheDocument();
    expect(screen.getByText("Tanggal Akun Dibuat")).toBeInTheDocument();
  });

  test("validates required fields", async () => {
    await act(async () => {
      render(<UserEdit />);
    });

    // Clear required fields
    fireEvent.change(screen.getByLabelText("Nama Lengkap"), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText("No. WA"), { target: { value: '' } });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: /simpan/i }));
    });

    expect(screen.getByText("Nama lengkap wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("No. WA wajib diisi")).toBeInTheDocument();
  });

  test("submits the form with valid data", async () => {
    await act(async () => {
      render(<UserEdit />);
    });

    fireEvent.change(screen.getByLabelText("Nama Lengkap"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText("No. WA"), {
      target: { value: "08123456789" },
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: /simpan/i }));
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard/user");
    });
  });

  test("clicking cancel button navigates back", async () => {
    await act(async () => {
      render(<UserEdit />);
    });

    fireEvent.click(screen.getByRole("button", { name: /batalkan/i }));
    expect(mockBack).toHaveBeenCalled();
  });

  test("displays correct role name", async () => {
    await act(async () => {
      render(<UserEdit />);
    });

    expect(screen.getByLabelText("Role")).toHaveValue("User");
  });

  test("displays empty role name for invalid role id", async () => {
    await act(async () => {
      render(<UserEdit />);
    });

    // Change the role id to an invalid value
    fireEvent.change(screen.getByLabelText("Role"), {
      target: { value: "invalid_role_id" },
    });

    expect(screen.getByLabelText("Role")).toHaveValue("");
  });

  test("does not submit the form when required fields are missing", async () => {
    await act(async () => {
      render(<UserEdit />);
    });

    // Clear required fields
    fireEvent.change(screen.getByLabelText("Nama Lengkap"), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText("No. WA"), { target: { value: '' } });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: /simpan/i }));
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  test("toggles password field correctly", async () => {
    await act(async () => {
      render(<UserEdit />);
    });

    const toggleButton = screen.getByRole("button", { name: /ganti password/i });
    fireEvent.click(toggleButton);

    expect(screen.getByLabelText("Password")).not.toBeDisabled();

    fireEvent.click(toggleButton);

    expect(screen.getByLabelText("Password")).toBeDisabled();
  });

  test("displays error message when fetching user data fails", async () => {
    // Mock fetch API to return an error
    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: false,
      });
    });

    await act(async () => {
      render(<UserEdit />);
    });

    expect(screen.getByText("Failed to fetch user data")).toBeInTheDocument();
  });

  test("displays error message when updating user data fails", async () => {
    // Mock fetch API to return an error on update
    global.fetch = jest.fn().mockImplementation((url, options) => {
      if (options?.method === 'PUT') {
        return Promise.resolve({
          ok: false,
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          nokar: "12345",
          fullname: "Test User",
          username: "testuser",
          divisiId: "1",
          role: "1",
          waNumber: "08123456789",
          createdOn: "2025-02-12T00:00:00.000Z",
        }),
      });
    });

    await act(async () => {
      render(<UserEdit />);
    });

    fireEvent.change(screen.getByLabelText("Nama Lengkap"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText("No. WA"), {
      target: { value: "08123456789" },
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: /simpan/i }));
    });

    await waitFor(() => {
      expect(screen.getByText("Failed to update user")).toBeInTheDocument();
    });
  });

  test("displays 'Invalid date' when createdOn is not a valid date", async () => {
    // Mock fetch API to return invalid date
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url === "http://localhost:8000/user/1") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            nokar: "12345",
            fullname: "Test User",
            username: "testuser",
            divisiId: "1",
            role: "1",
            waNumber: "08123456789",
            createdOn: "invalid-date",
          }),
        });
      }
      return Promise.reject(new Error("Failed to fetch"));
    });

    await act(async () => {
      render(<UserEdit />);
    });

    expect(screen.getByLabelText("Tanggal Akun Dibuat")).toHaveValue("Invalid date");
  });
});